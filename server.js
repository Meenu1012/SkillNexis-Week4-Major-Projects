
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const uploadRoutes = require("./routes/uploads");
const projectRoutes = require("./routes/projects");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Main API
app.get("/", (req, res) => {
  res.json({
    message: "Project Management Dashboard API is running"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Task management routes
app.use("/api/tasks", taskRoutes);

// Image upload routes
app.use("/api/uploads", uploadRoutes);

// Project management routes
app.use("/api/projects", projectRoutes);

// Server port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log("Server running at http://localhost:" + PORT);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });
