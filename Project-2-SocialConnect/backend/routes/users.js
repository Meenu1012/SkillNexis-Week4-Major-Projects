
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get all users
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId }
    }).select("name email profilePicture bio followers following");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
});

// Follow a user
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.userId === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (currentUser.following.some(id => id.toString() === targetUser._id.toString())) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: `You are now following ${targetUser.name}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to follow user" });
  }
});

// Unfollow a user
router.delete("/:id/follow", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUser._id.toString()
    );

    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: `You unfollowed ${targetUser.name}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to unfollow user" });
  }
});

module.exports = router;
