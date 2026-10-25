
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

async function canAccessProject(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return false;
  }

  return Boolean(
    await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { "members.user": userId }
      ]
    })
  );
}

// Create a task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, project, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    if (project && !(await canAccessProject(project, req.userId))) {
      return res.status(403).json({
        message: "You cannot access this project"
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      status: status || "pending",
      user: req.userId,
      project: project || null,
      assignedTo: assignedTo || null
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message
    });
  }
});

// Get tasks belonging to the logged-in user
// Optionally filter by project or status
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = { user: req.userId };

    if (req.query.project) {
      if (!(await canAccessProject(req.query.project, req.userId))) {
        return res.status(403).json({
          message: "You cannot access this project"
        });
      }

      filter.project = req.query.project;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter).sort({
      createdAt: -1
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message
    });
  }
});

// Update a task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, project, assignedTo } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty"
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) updates.description = description;

    if (status !== undefined) {
      if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid task status"
        });
      }
      updates.status = status;
    }

    if (project !== undefined) {
      if (project && !(await canAccessProject(project, req.userId))) {
        return res.status(403).json({
          message: "You cannot access this project"
        });
      }
      updates.project = project || null;
    }

    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo || null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update task",
      error: error.message
    });
  }
});

// Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
});

module.exports = router;
