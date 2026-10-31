const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Authentication middleware
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// Create a post
router.post("/", auth, async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            user: req.userId,
            content: content.trim(),
            image: image || ""
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get all posts
router.get("/", auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name profilePicture")
            .populate("comments.user", "name")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Like or unlike a post
router.put("/:id/like", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const alreadyLiked = post.likes.some(
            (userId) => userId.toString() === req.userId.toString()
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (userId) => userId.toString() !== req.userId.toString()
            );
        } else {
            post.likes.push(req.userId);

            // Create notification only when another user likes the post
            if (post.user.toString() !== req.userId.toString()) {
                const sender = await User.findById(req.userId).select("name");

                await Notification.create({
                    recipient: post.user,
                    sender: req.userId,
                    type: "like",
                    message: `${sender?.name || "Someone"} liked your post.`,
                    post: post._id
                });
            }
        }

        await post.save();

        res.json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
            liked: !alreadyLiked
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a comment to a post
router.post("/:id/comment", auth, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        post.comments.push({
            user: req.userId,
            text: text.trim()
        });

        await post.save();

        // Create notification only when another user comments
        if (post.user.toString() !== req.userId.toString()) {
            const sender = await User.findById(req.userId).select("name");

            await Notification.create({
                recipient: post.user,
                sender: req.userId,
                type: "comment",
                message: `${sender?.name || "Someone"} commented on your post.`,
                post: post._id
            });
        }

        const updatedPost = await Post.findById(post._id)
            .populate("user", "name")
            .populate("comments.user", "name");

        res.status(201).json({
            message: "Comment added successfully",
            post: updatedPost
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Edit your own post
router.put("/:id", auth, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You can only edit your own posts"
            });
        }

        post.content = content.trim();

        await post.save();

        res.json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Delete your own post
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You can only delete your own posts"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
