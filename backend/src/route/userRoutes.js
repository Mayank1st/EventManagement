const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");
const verifyToken = require("../middlewares/authMiddleware");
const verifyRoles = require("../middlewares/roleMiddleware");
const mongoose = require("mongoose");
const userRouter = express.Router();
const cron = require("node-cron");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// User Registration
userRouter.post("/register", upload.single("photo"), async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;
  const photo = req.file ? req.file.path : null;

  try {
    if (!username || !email || !password || !confirmPassword || !role) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "false",
        message: "Password and Confirm password are not the same",
      });
    }

    const validRoles = ["Admin", "Organizer", "User"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid role specified",
      });
    }

    const isUserExisting = await userModel.findOne({ email });
    if (isUserExisting) {
      return res
        .status(409)
        .json({ status: "failed", message: "Email already exists" });
    }

    const SALT = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, SALT);

    const newUser = await new userModel({
      username,
      email,
      password: hashedPassword,
      photo,
      roles: [role], // Use the role from the request
    }).save();

    if (!newUser) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to register the user, please try again",
      });
    }

    const token = jwt.sign(
      { id: newUser._id, roles: newUser.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "Successful",
      message: "User registered successfully",
      token,
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// User Login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and Password fields are required",
      });
    }

    const isUserExisting = await userModel.findOne({ email });
    if (!isUserExisting || isUserExisting.isDisabled) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, isUserExisting.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: isUserExisting._id, roles: isUserExisting.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "Successful",
      message: "Login Successful",
      token,
      userId: isUserExisting._id,
      roles: isUserExisting.roles,
      username: isUserExisting.username,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Error", message: "Internal Error occurred" });
  }
});

// Admin: Disable User
userRouter.patch(
  "/disableuser/:id",
  verifyToken,
  verifyRoles("Admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await userModel.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "User not found" });
      }

      user.isDisabled = true;
      await user.save();

      res
        .status(200)
        .json({ status: "success", message: "User disabled successfully" });
    } catch (error) {
      console.error("Error disabling user:", error);
      res.status(500).json({
        status: "failed",
        message: "Internal error, please try again later",
      });
    }
  }
);

// Admin: Enable User
userRouter.patch(
  "/enableuser/:id",
  verifyToken,
  verifyRoles("Admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await userModel.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "User not found" });
      }

      user.isDisabled = false;
      await user.save();

      res
        .status(200)
        .json({ status: "success", message: "User enabled successfully" });
    } catch (error) {
      console.error("Error enabling user:", error);
      res.status(500).json({
        status: "failed",
        message: "Internal error, please try again later",
      });
    }
  }
);

// User Profile Route
userRouter.get("/user-profile", verifyToken, async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("username email photo roles");

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    // Handle different roles
    if (user.roles.includes("Organizer")) {
      // Additional organizer-specific data can be fetched and returned here
      const organizerData = {
        username: user.username,
        photo: user.photo,
        // You can include other organizer-specific data here
      };
      return res.status(200).json({ status: "success", user: organizerData });
    } else if (user.roles.includes("User")) {
      // Regular user response
      return res.status(200).json({ status: "success", user: user });
    } else {
      return res
        .status(403)
        .json({ status: "failed", message: "Access denied" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});



// Event Creation
userRouter.post("/events", verifyToken, async (req, res) => {
  const { title, location, maxpeoples, startingdate, enddate, username } = req.body;

  try {
    const newEvent = new eventModel({
      title,
      location,
      maxpeoples,
      startingdate,
      enddate,
      creator: req.user.id,
      username, 
    });

    const savedEvent = await newEvent.save();

    // Emit event creation to all connected clients
    req.io.emit("eventCreated", savedEvent);

    res.status(201).json({ status: "success", data: savedEvent });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});


// All events
userRouter.get("/events-log", verifyToken, async (req, res) => {
  try {
    const events = await eventModel.find();

    console.log("Fetched Events:", events);

    res.status(200).json({ status: "success", data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ status: "Failed", message: "Internal error occurred!" });
  }
});


// Get all events created by the organizer (user)
userRouter.get("/organizer-events", verifyToken, async (req, res) => {
  try {
    const { username } = req.query;

    // Find all events where the 'username' matches the 'creator' field
    const events = await eventModel.find({ username });

    if (events.length === 0) {
      return res.status(404).json({ status: "Failed", message: "No events found for this user." });
    }

    res.status(200).json({ status: "success", events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Internal error occurred!" });
  }
});



// Update Event
userRouter.put("/events/:eventId", verifyToken, async (req, res) => {
  const { eventId } = req.params;
  const { title, location, maxpeoples, startingdate, enddate } = req.body;

  try {
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      { title, location, maxpeoples, startingdate, enddate },
      { new: true }
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    // Notify all attendees about the event update
    const attendees = await userModel.find({ _id: { $in: updatedEvent.attendees } });
    const emailAddresses = attendees.map(attendee => attendee.email);

    emailAddresses.forEach(email => {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Event Updated: ' + updatedEvent.title,
        text: `
          Hello,

          The event "${updatedEvent.title}" has been updated. Here are the new details:

          Location: ${updatedEvent.location}
          Max People: ${updatedEvent.maxpeoples}
          Starting Date: ${new Date(updatedEvent.startingdate).toLocaleString()}
          End Date: ${new Date(updatedEvent.enddate).toLocaleString()}

          Best regards,
          Event Management Team
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending update email:", error);
        } else {
          console.log("Update email sent:", info.response);
        }
      });
    });

    // Emit event update to all connected clients
    req.io.emit("eventUpdated", updatedEvent);

    res.status(200).json({ status: "success", data: updatedEvent });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});




// Join Event
userRouter.post("/events/:eventId/join", verifyToken, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await eventModel.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    if (event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Already joined" });
    }

    if (event.attendees.length >= event.maxpeoples) {
      return res
        .status(400)
        .json({ status: "failed", message: "Event is full" });
    }

    event.attendees.push(userId);
    await event.save();

    // Emit event join to all connected clients
    req.io.emit("eventJoined", { eventId, userId });

    res.status(200).json({ status: "success", message: "Joined the event" });
  } catch (error) {
    console.error("Error joining event:", error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});



// Leave Event
userRouter.post("/events/:eventId/leave", verifyToken, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await eventModel.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    if (!event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Not joined" });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== userId
    );
    await event.save();

    // Emit event leave to all connected clients
    req.io.emit("eventLeft", { eventId, userId });

    res.status(200).json({ status: "success", message: "Left the event" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// Cron job for sending reminders 24 hours before an event
cron.schedule('0 9 * * *', async () => {  // Runs every day at 9:00 AM
  try {
    const now = new Date();
    const reminderDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const upcomingEvents = await eventModel.find({
      startingdate: { $lte: reminderDate },
      startingdate: { $gt: now }
    });

    upcomingEvents.forEach(async (event) => {
      const attendees = await userModel.find({ _id: { $in: event.attendees } });
      const emailAddresses = attendees.map(attendee => attendee.email);

      emailAddresses.forEach(email => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Event Reminder: ' + event.title,
          text: `
            Hello,

            This is a reminder that the event "${event.title}" will start tomorrow. Here are the details:

            Location: ${event.location}
            Max People: ${event.maxpeoples}
            Starting Date: ${new Date(event.startingdate).toLocaleString()}
            End Date: ${new Date(event.enddate).toLocaleString()}

            Best regards,
            Event Management Team
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending reminder email:", error);
          } else {
            console.log("Reminder email sent:", info.response);
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in reminder cron job:", error);
  }
});

// Cron job for sending feedback requests 24 hours after an event ends
cron.schedule('0 9 * * *', async () => {  // Runs every day at 9:00 AM
  try {
    const now = new Date();
    const feedbackDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const endedEvents = await eventModel.find({
      enddate: { $lte: feedbackDate }
    });

    endedEvents.forEach(async (event) => {
      const attendees = await userModel.find({ _id: { $in: event.attendees } });
      const emailAddresses = attendees.map(attendee => attendee.email);

      emailAddresses.forEach(email => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Feedback Request: ' + event.title,
          text: `
            Hello,

            We hope you enjoyed the event "${event.title}". We would appreciate it if you could take a moment to provide your feedback.

            Event Details:
            Location: ${event.location}
            Max People: ${event.maxpeoples}
            Starting Date: ${new Date(event.startingdate).toLocaleString()}
            End Date: ${new Date(event.enddate).toLocaleString()}

            Please reply to this email with your feedback.

            Best regards,
            Event Management Team
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending feedback email:", error);
          } else {
            console.log("Feedback email sent:", info.response);
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in feedback cron job:", error);
  }
});

module.exports = (io) => {
  userRouter.io = io;
  return userRouter;
};
