const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");
const verifyToken = require("../middlewares/authMiddleware");
const verifyRoles = require("../middlewares/roleMiddleware");
const mongoose = require("mongoose");
const userRouter = express.Router();
const cron = require('node-cron');

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

    if (!user || user.roles[0] !== "User") {
      return res
        .status(403)
        .json({ status: "failed", message: "Access denied" });
    }
    res.status(200).json({ status: "success", user: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// Event Creation
userRouter.post("/events", verifyToken, async (req, res) => {
  const { title, location, maxpeoples, startingdate, enddate } = req.body;

  try {
    const newEvent = new eventModel({
      title,
      location,
      maxpeoples,
      startingdate,
      enddate,
      creator: req.user.id,
    });

    const savedEvent = await newEvent.save();

    // Emit event creation to all connected clients
    req.io.emit('eventCreated', savedEvent);

    res.status(201).json({ status: "success", data: savedEvent });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// Join Event
userRouter.post("/events/join/:eventId", verifyToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await eventModel.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    if (event.attendees.includes(req.user.id)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Already joined the event" });
    }

    if (event.attendees.length >= event.maxpeoples) {
      return res
        .status(400)
        .json({ status: "failed", message: "Event is full" });
    }

    event.attendees.push(req.user.id);
    await event.save();

    // Emit event update to all connected clients
    req.io.emit('eventUpdated', event);

    res.status(200).json({ status: "success", message: "Joined the event" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// Event Update
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

    // Emit event update to all connected clients
    req.io.emit('eventUpdated', updatedEvent);

    res.status(200).json({ status: "success", data: updatedEvent });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

// Event Deletion
userRouter.delete("/events/:eventId", verifyToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await eventModel.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ status: "failed", message: "Event not found" });
    }

    // Emit event deletion to all connected clients
    req.io.emit('eventDeleted', eventId);

    res.status(200).json({ status: "success", message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal error occurred!" });
  }
});

module.exports = (io) => {
  userRouter.io = io;
  return userRouter;
};
