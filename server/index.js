// Load Environment & Dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const petController = require("./controllers/pet"); // Adjust path
const { auth } = require("./middlewares/auth");
const adoptionRequestRoutes = require("./routes/adoptionRequest");
const userRoutes = require("./routes/user");
const petRoutes = require("./routes/pet");
const chatRoutes = require("./routes/chat");
const webhookRoutes = require("./routes/webhook");
const authRoutes = require("./routes/auth");
const imageDetectionRoutes = require("./routes/imageDetection");
const listingGenerationRoutes = require("./routes/listingGeneration");

// Connect to Database
const { connectDB } = require("./config/connect");

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Configure CORS to allow specific origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://209.38.211.146",
  "https://pawfect.pl",
  "https://www.pawfect.pl",
  "http://64.227.68.1",
  "https://64.227.68.1",
  "http://64.227.68.1:3000",
  "https://64.227.68.1:3000",
  "http://192.168.100.5:3000",
  "http://192.168.100.5:3001",
  "https://pawfectsite.vercel.app",
  "https://pawfectf-p2su.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});


const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) === -1 && !origin.endsWith(".ojest.pl")) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.log(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

// Handle preflight requests FIRST, before any other middleware
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log all incoming requests
app.use((req, res, next) => {
  next();
});

// Debug route to check if API is working
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Set Up Routes
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/adoption-requests", adoptionRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/image-detection", imageDetectionRoutes);
app.use("/api/generate-listing", listingGenerationRoutes);
app.use("/api", webhookRoutes);

// Pass io to pet controller
petController.setIo(io);
// Socket.IO Logic
require("./socket/socket")(io);

// Handle unknown routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the Server
const PORT = process.env.PORT || 5000;



// Start server only after MongoDB connection is established
const startServer = async () => {
  try {
    // Wait for MongoDB connection
    await connectDB;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api`);
      console.log(`Network access available at http://192.168.100.5:${PORT}/api`);
    });


  } catch (error) {
    console.error("Failed to start server:", error);
    // For development, start server even if MongoDB fails
    if (process.env.NODE_ENV === "development") {
      console.log("Starting server without MongoDB for development...");
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT} (without MongoDB)`);
        console.log(`API Documentation available at http://localhost:${PORT}/api`);
        console.log(`Network access available at http://192.168.100.5:${PORT}/api`);
      });


    } else {
      process.exit(1);
    }
  }
};

startServer();
