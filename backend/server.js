require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/database");
const cors = require("cors");
const path = require('path');
const userRouter = require("./src/route/userRoutes");
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_HOST,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_HOST,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});


// User Route
app.use("/user", userRouter(io));

// Home Route
app.use("/", (req, res) => {
  res.send("This is home route");
});

// Wrong Route
app.use((req, res) => {
  res.status(404).json({ status: "Failed", message: "Page Not found" });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Listen Server
server.listen(PORT, async () => {
  try {
    await connectDB(DB_URL);
    console.log(`Server is listening at PORT : ${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
