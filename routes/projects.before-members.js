
const express = require("express");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create a project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      owner: req.userId,
      members: [
        {
          user: req.userId,
          role: "admin"
        }
      ]
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message
    });
  }
});

// Get projects owned by or shared with the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { "members.user": req.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get projects",
      error: error.message
    });
  }
});

// Update a project (owner/admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    const { name, description } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty"
        });
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    await project.save();

    res.json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update project",
      error: error.message
    });
  }
});

// Delete a project (owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete project",
      error: error.message
    });
  }
});

module.exports = router;
