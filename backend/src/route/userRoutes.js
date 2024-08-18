const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userModel = require("../models/userModel");
const verifyToken = require("../middlewares/authMiddleware");
const eventModel = require("../models/eventModel");

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
  const { username, email, password, confirmPassword } = req.body;
  const photo = req.file ? req.file.path : null;

  try {
    if (!username || !email || !password || !confirmPassword) {
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
    }).save();

    if (!newUser) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to register the user, please try again",
      });
    }

    // JWT Web Tokens
    const token = jwt.sign(
      { id: newUser._id, roles: newUser.roles }, // Include roles in token payload
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log(newUser);
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
    if (!isUserExisting) {
      return res
        .status(400)
        .json({ status: "failed", message: "User not found, please register" });
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
      userId: isUserExisting._id, // Send the user ID
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Error", message: "Internal Error occurred" });
  }
});


// User Profile
userRouter.get("/profile", verifyToken, async (req, res) => {
  try {
    // Find the user by ID from the token
    const user = await userModel
      .findById(req.user.id)
      .select("username email photo");

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    // Return the user's profile details
    res.status(200).json({
      status: "success",
      user: {
        username: user.username,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal error, please try again later",
    });
  }
});

// Update Profile starts
userRouter.patch("/updateprofile/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const photo = req.file ? req.file.path : null; // Get the new photo path if provided

  try {
    const isUserExisting = await userModel.findById(id);
    if (!isUserExisting) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    // Update the data
    const update = {
      username: username || isUserExisting.username,
      email: email || isUserExisting.email,
      photo: photo || isUserExisting.photo // Only update photo if a new one is provided
    };

    const updatedProfile = await userModel.findByIdAndUpdate(id, update, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ status: "failed", message: "Updation Failed, please try again" });
    }

    res.status(200).json({ status: "Success", message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ status: "failed", message: "Internal error, please try again later" });
  }
});

// Update Profile ends

// Create Event
userRouter.post("/createevent", verifyToken, async (req, res) => {
  const { title, location, maxpeoples, startingdate, enddate } = req.body;
  const creator = req.user.id; 

  try {
    // Required Fields
    if (!title || !location || !maxpeoples || !startingdate || !enddate) {
      return res.status(401).json({ status: "failed", message: "All fields are required" });
    }

    const newEvent = await new eventModel({
      creator,
      title,
      location,
      maxpeoples,
      startingdate,
      enddate,
    }).save();

    if (!newEvent) {
      return res.status(401).json({
        status: "failed",
        message: "Event creation failed, please try again",
        data: newEvent,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error", message: "Internal Error" });
  }
});


// Event Log
userRouter.get("/eventlog", async (req, res) => {
  try {
    const data = await eventModel.find();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", message: "Internal Error" });
  }
});

userRouter.get("/users", async (req, res) => {
  try {
    const users = await userModel.find({}, "username _id");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ status: "failed", message: "Internal error" });
  }
});




// eventModel 
userRouter.get('/event-capacity', async (req, res) => {
  try {
    const events = await eventModel.find();

    const eventsWithCapacity = events.map(event => {
      const attendees = event.attendees || 0; 
      const maxpeoples = event.maxpeoples || 1; 
      const percentageFilled = Number(((attendees / maxpeoples) * 100).toFixed(2)); 

      return {
        ...event.toObject(),
        percentageFilled,
      };
    });

    res.json(eventsWithCapacity);
  } catch (error) {
    console.error("Error fetching event capacity:", error);
    res.status(500).json({ message: 'Error fetching event capacity' });
  }
});


userRouter.get('/top-events', async (req, res) => {
  try {
    const events = await eventModel.aggregate([ 
      {
        $project: {
          title: 1,
          location: 1,
          startingdate: 1,
          enddate: 1,
          maxpeoples: 1,
          attendees: 1,
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ["$attendees", 0.5] }, // Weight of attendees
              { $multiply: ["$averageRating", 10] } // Weight of average rating
            ],
          },
        },
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 5 },
    ]);

    res.json(events);
  } catch (error) {
    console.error("Error fetching top events:", error);
    res.status(500).json({ message: 'Error fetching top events' });
  }
});

module.exports = userRouter;
