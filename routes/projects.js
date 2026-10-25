
const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function findOwnedProject(projectId, userId) {
  if (!validId(projectId)) return null;

  return Project.findOne({
    _id: projectId,
    owner: userId
  });
}

// Create a project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      owner: req.userId,
      members: [{ user: req.userId, role: "admin" }]
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

// List projects owned by or shared with the logged-in user
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

// View members of a project
router.get("/:id/members", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { "members.user": req.userId }
      ]
    }).populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied"
      });
    }

    res.json({
      members: project.members.map(member => ({
        userId: member.user?._id,
        name: member.user?.name,
        email: member.user?.email,
        role: member.role
      }))
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get project members",
      error: error.message
    });
  }
});

// Add a registered user by email (project owner only)
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const project = await findOwnedProject(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    const { email, role = "member" } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        message: "Role must be admin or member"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        message: "No registered user found with that email"
      });
    }

    if (user._id.toString() === project.owner.toString()) {
      return res.status(400).json({
        message: "The project owner is already an admin"
      });
    }

    const existingMember = project.members.find(
      member => member.user.toString() === user._id.toString()
    );

    if (existingMember) {
      existingMember.role = role;
    } else {
      project.members.push({
        user: user._id,
        role
      });
    }

    await project.save();

    res.json({
      message: existingMember
        ? "Member role updated successfully"
        : "Member added successfully",
      member: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add member",
      error: error.message
    });
  }
});

// Remove a project member (project owner only)
router.delete("/:id/members/:userId", authMiddleware, async (req, res) => {
  try {
    const project = await findOwnedProject(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    if (!validId(req.params.userId)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({
        message: "The project owner cannot be removed"
      });
    }

    const originalLength = project.members.length;

    project.members = project.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    if (project.members.length === originalLength) {
      return res.status(404).json({
        message: "Project member not found"
      });
    }

    await project.save();

    res.json({
      message: "Project member removed successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to remove member",
      error: error.message
    });
  }
});

// Update project details (owner only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await findOwnedProject(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    const { name, description } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
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
    const project = await findOwnedProject(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    await project.deleteOne();

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
