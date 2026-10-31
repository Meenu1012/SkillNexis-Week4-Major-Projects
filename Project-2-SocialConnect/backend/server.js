
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/uploads");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Home route
app.get("/", (req, res) => {
  res.send("Social Media Feed API is running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Social Media Feed API is working",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Social media posts routes
app.use("/api/posts", postRoutes);

// Follow / Unfollow routes
app.use("/api/users", userRoutes);

// Notifications routes
app.use("/api/notifications", notificationRoutes);

// Image upload route
app.use("/api/upload", uploadRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully");
    } else {
      console.log("MONGO_URI not configured. Starting without database.");
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
