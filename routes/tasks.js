
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["pending", "in-progress", "completed"];

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getAccessibleProject(projectId, userId) {
  if (!projectId || !validId(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { "members.user": userId }
    ]
  });
}

async function validateAssignee(assignedTo, projectId) {
  if (!assignedTo) return null;

  let user;

  if (validId(assignedTo)) {
    user = await User.findById(assignedTo);
  } else {
    user = await User.findOne({
      email: String(assignedTo).trim().toLowerCase()
    });
  }

  if (!user) {
    throw new Error("No registered user found for this assignee");
  }

  if (projectId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    const isOwner =
      project.owner.toString() === user._id.toString();

    const isMember = project.members.some(
      member => member.user.toString() === user._id.toString()
    );

    if (!isOwner && !isMember) {
      throw new Error("Assignee must be a member of this project");
    }
  }

  return user._id;
}

// Check whether a user can manage project tasks.
function canManageProjectTasks(project, userId) {
  if (!project) return false;

  if (project.owner.toString() === userId) {
    return true;
  }

  return project.members.some(
    member =>
      member.user.toString() === userId &&
      member.role === "admin"
  );
}

// Create a task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, project, assignedTo } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    let projectId = null;

    if (project) {
      const accessibleProject = await getAccessibleProject(
        project,
        req.userId
      );

      if (!accessibleProject) {
        return res.status(403).json({
          message: "You cannot access this project"
        });
      }

      projectId = accessibleProject._id;
    }

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    let assigneeId;

    try {
      assigneeId = await validateAssignee(assignedTo, projectId);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      status: status || "pending",
      user: req.userId,
      project: projectId,
      assignedTo: assigneeId
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

// List tasks; optionally filter by project and status
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};

    if (req.query.project) {
      const project = await getAccessibleProject(
        req.query.project,
        req.userId
      );

      if (!project) {
        return res.status(403).json({
          message: "You cannot access this project"
        });
      }

      filter.project = project._id;
    } else {
      filter.$or = [
        { user: req.userId },
        { assignedTo: req.userId }
      ];
    }

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid task status"
        });
      }

      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

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
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    let project = null;

    if (task.project) {
      project = await getAccessibleProject(
        task.project,
        req.userId
      );

      if (!project) {
        return res.status(403).json({
          message: "You cannot access this task"
        });
      }
    }

    const isCreator = task.user.toString() === req.userId;

    const isOwner =
      project &&
      project.owner.toString() === req.userId;

    const projectMember = project?.members.find(
      member => member.user.toString() === req.userId
    );

    const isAdmin = projectMember?.role === "admin";

    const isAssignedMember =
      task.assignedTo?.toString() === req.userId;

    const isStatusOnlyUpdate =
      Object.keys(req.body).length === 1 &&
      Object.prototype.hasOwnProperty.call(req.body, "status");

    const canEditTask = isCreator || isOwner || isAdmin;

    const canUpdateAssignedStatus =
      isAssignedMember && isStatusOnlyUpdate;

    if (!canEditTask && !canUpdateAssignedStatus) {
      return res.status(403).json({
        message: "You do not have permission to edit this task"
      });
    }

    const {
      title,
      description,
      status,
      project: requestedProject,
      assignedTo
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty"
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Task description must be a string"
        });
      }

      task.description = description;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status"
        });
      }

      task.status = status;
    }

    if (requestedProject !== undefined) {
      if (requestedProject) {
        const newProject = await getAccessibleProject(
          requestedProject,
          req.userId
        );

        if (!newProject) {
          return res.status(403).json({
            message: "You cannot access the requested project"
          });
        }

        task.project = newProject._id;
      } else {
        task.project = null;
      }
    }

    if (assignedTo !== undefined) {
      try {
        task.assignedTo = await validateAssignee(
          assignedTo,
          task.project
        );
      } catch (error) {
        return res.status(400).json({
          message: error.message
        });
      }
    }

    await task.save();

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
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    let project = null;

    if (task.project) {
      project = await getAccessibleProject(
        task.project,
        req.userId
      );

      if (!project) {
        return res.status(403).json({
          message: "You cannot access this task"
        });
      }
    }

    const isCreator = task.user.toString() === req.userId;

    const canManageProject = canManageProjectTasks(
      project,
      req.userId
    );

    if (!isCreator && !canManageProject) {
      return res.status(403).json({
        message: "You do not have permission to delete this task"
      });
    }

    await task.deleteOne();

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
