const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");
const verifyToken = require("../middlewares/authMiddleware");
const verifyRoles = require("../middlewares/roleMiddleware");
const mongoose = require("mongoose");
const userRouter = express.Router();

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

    // Validate role
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

    // JWT Web Tokens
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

    // JWT Token
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
      res
        .status(500)
        .json({
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
      res
        .status(500)
        .json({
          status: "failed",
          message: "Internal error, please try again later",
        });
    }
  }
);

// Fetch user profile
userRouter.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("username email photo roles isDisabled");

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      user: {
        username: user.username,
        email: user.email,
        photo: user.photo,
        roles: user.roles,
        isDisabled: user.isDisabled,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res
      .status(500)
      .json({
        status: "failed",
        message: "Internal error, please try again later",
      });
  }
});

// Create Event
userRouter.post(
  "/createevent",
  verifyToken,
  verifyRoles("Organizer", "Admin"),
  async (req, res) => {
    const { title, location, maxpeoples, startingdate, enddate } = req.body;
    const creator = req.user.id;

    try {
      if (!title || !location || !maxpeoples || !startingdate || !enddate) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required" });
      }

      const newEvent = new eventModel({
        title,
        location,
        maxpeoples,
        startingdate,
        enddate,
        creator,
        attendees: [creator], // Automatically add the creator as an attendee
      });

      await newEvent.save();
      res.status(201).json({
        status: "success",
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      res
        .status(500)
        .json({
          status: "failed",
          message: "Internal error, please try again later",
        });
    }
  }
);

// Fetch Events Created by Logged-In User
userRouter.get("/myevents", verifyToken, async (req, res) => {
  try {
    const { id } = req.user;

    const events = await eventModel.find({ creator: id });

    if (!events) {
      return res
        .status(404)
        .json({ status: "failed", message: "No events found for this user" });
    }

    res.status(200).json({ status: "success", events });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res
      .status(500)
      .json({
        status: "failed",
        message: "Internal error, please try again later",
      });
  }
});

// Fetch Top Events
userRouter.get("/top-events", async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .sort({ "attendees.length": -1 }) // Sort by number of attendees
      .limit(5); // Limit to top 5 events

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching top events:", error);
    res
      .status(500)
      .json({
        status: "failed",
        message: "Internal error, please try again later",
      });
  }
});

// Apply/Remove Event
userRouter.patch("/applyevent/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const event = await eventModel.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    if (event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Already applied to this event" });
    }

    event.attendees.push(userId);
    await event.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Applied to the event successfully",
      });
  } catch (error) {
    console.error("Error applying to event:", error);
    res
      .status(500)
      .json({
        status: "failed",
        message: "Internal error, please try again later",
      });
  }
});

userRouter.delete("/removeevent/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const event = await eventModel.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== userId.toString()
    );
    await event.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Removed from the event successfully",
      });
  } catch (error) {
    console.error("Error removing from event:", error);
    res
      .status(500)
      .json({
        status: "failed",
        message: "Internal error, please try again later",
      });
  }
});

// Update Event
userRouter.put(
  "/updateevent/:id",
  verifyToken,
  verifyRoles("Organizer", "Admin"),
  async (req, res) => {
    const { id } = req.params;
    const { title, location, maxpeoples, startingdate, enddate } = req.body;
    const creator = req.user.id;

    try {
      const event = await eventModel.findById(id);

      if (!event) {
        return res
          .status(404)
          .json({ status: "failed", message: "Event not found" });
      }

      if (event.creator.toString() !== creator) {
        return res
          .status(403)
          .json({
            status: "failed",
            message: "Not authorized to update this event",
          });
      }

      event.title = title || event.title;
      event.location = location || event.location;
      event.maxpeoples = maxpeoples || event.maxpeoples;
      event.startingdate = startingdate || event.startingdate;
      event.enddate = enddate || event.enddate;

      await event.save();

      res
        .status(200)
        .json({
          status: "success",
          message: "Event updated successfully",
          event,
        });
    } catch (error) {
      console.error("Error updating event:", error);
      res
        .status(500)
        .json({
          status: "failed",
          message: "Internal error, please try again later",
        });
    }
  }
);

module.exports = userRouter;
