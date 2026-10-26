
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "SkillNexis E-Commerce API is running",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "E-Commerce backend is working",
  });
});

// Product routes
app.use("/api/products", productRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Shopping cart routes
app.use("/api/cart", cartRoutes);

// Order and checkout routes
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`E-Commerce server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
