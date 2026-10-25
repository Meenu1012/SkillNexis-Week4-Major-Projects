
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Get the saved image for the logged-in user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("profileImage");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      imageUrl: user.profileImage || ""
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not retrieve image"
    });
  }
});

// Upload an image and save its URL in MongoDB
router.post("/", authenticateToken, (req, res) => {
  upload.single("image")(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image"
      });
    }

    try {
      const imageUrl = "/uploads/" + req.file.filename;

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          profileImage: imageUrl
        },
        {
          new: true
        }
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.status(201).json({
        message: "Image uploaded successfully",
        imageUrl
      });
    } catch (dbError) {
      res.status(500).json({
        message: "Image uploaded, but its URL could not be saved"
      });
    }
  });
});

module.exports = router;
