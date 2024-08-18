require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/database");
const cors = require("cors");
const path = require('path');
const userRouter = require("./src/route/userRoutes");

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const app = express();
app.use(express.json());

const corsOptions = {
  // set origin to a specific origin.
  origin: process.env.FRONTEND_HOST,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User Route

app.use("/user", userRouter);

// Home Route
app.use("/", (req, res) => {
  res.send("This is home route");
});

// Wrong Route
app.use((req, res) => {
  res.status(404).json({ status: "Failed", message: "Page Not found" });
});

// Listen Server
app.listen(PORT, async (req, res) => {
  try {
    await connectDB(DB_URL);
    console.log(`Server is listening at PORT : ${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
