
import { useEffect, useState } from "react";
import API from "../api";

function Feed({ user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const currentUserId = user?._id || user?.id;

  // Load all posts
  const loadPosts = async () => {
    try {
      const response = await API.get("/posts");
      setPosts(response.data);
    } catch (error) {
      setMessage("Could not load posts.");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Select image from device
  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setImage("");
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedFile(null);
    setImage("");
    setPreview("");
  };

  // Create a post with optional image
  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setMessage("Please write something first.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = image.trim();

      // Upload selected image first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadResponse = await API.post(
          "/upload",
          formData
        );

        imageUrl = uploadResponse.data.imageUrl;
      }

      // Create post
      await API.post("/posts", {
        content: content.trim(),
        image: imageUrl,
      });

      setContent("");
      setImage("");
      setSelectedFile(null);
      setPreview("");
      setMessage("Post published successfully!");

      await loadPosts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to publish post."
      );
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
    setMessage("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  // Save edited post
  const saveEdit = async (postId) => {
    if (!editContent.trim()) {
      setMessage("Post content cannot be empty.");
      return;
    }

    try {
      await API.put(`/posts/${postId}`, {
        content: editContent.trim(),
      });

      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? { ...post, content: editContent.trim() }
            : post
        )
      );

      cancelEdit();
      setMessage("Post updated successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to update post."
      );
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await API.delete(`/posts/${postId}`);

      setPosts((previous) =>
        previous.filter((post) => post._id !== postId)
      );

      setMessage("Post deleted successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete post."
      );
    }
  };

  // Like or unlike post
  const handleLike = async (postId) => {
    try {
      await API.put(`/posts/${postId}/like`);
      await loadPosts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to like post."
      );
    }
  };

  // Add comment
  const addComment = async (postId) => {
    const text = commentTexts[postId]?.trim();

    if (!text) {
      setMessage("Please write a comment first.");
      return;
    }

    try {
      await API.post(`/posts/${postId}/comment`, { text });

      setCommentTexts((previous) => ({
        ...previous,
        [postId]: "",
      }));

      setMessage("Comment added successfully!");
      await loadPosts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to add comment."
      );
    }
  };

  return (
    <div className="feed-container">
      <h2>Your Social Feed</h2>

      {/* Create Post */}
      <form onSubmit={createPost} className="post-form">
        <div className="create-post-heading">
          <span className="avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </span>

          <strong>{user?.name || "User"}</strong>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows="4"
        />

        {/* Image URL */}
        <input
          type="url"
          value={image}
          onChange={(e) => {
            setImage(e.target.value);
            setSelectedFile(null);
            setPreview(e.target.value);
          }}
          placeholder="Paste image URL (optional)"
        />

        {/* Upload from Device */}
        <label className="upload-image-label">
          📷 Upload Image from Device
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
        </label>

        {/* Image Preview */}
        {preview && (
          <div>
            <img
              src={preview}
              alt="Post preview"
              className="post-image-preview"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <button type="button" onClick={removeImage}>
              ✖ Remove Image
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "✍️ Publish Post"}
        </button>
      </form>

      {message && <p className="feed-message">{message}</p>}

      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="empty-posts">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => {
            const postOwnerId =
              typeof post.user === "object"
                ? post.user?._id
                : post.user;

            const isOwner =
              String(postOwnerId) === String(currentUserId);

            const liked = post.likes?.some((like) => {
              const likeId =
                typeof like === "object" ? like._id : like;

              return String(likeId) === String(currentUserId);
            });

            const authorName = post.user?.name || "User";

            return (
              <article className="post-card" key={post._id}>
                {/* Post Header */}
                <div className="post-header">
                  {post.user?.profilePicture ? (
                    <img
                      className="post-avatar"
                      src={post.user.profilePicture}
                      alt={authorName}
                    />
                  ) : (
                    <span className="avatar">
                      {authorName.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="post-author">
                    <strong>{authorName}</strong>
                    <small>
                      {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>

                {/* Post Content */}
                {editingPostId === post._id ? (
                  <div className="edit-post-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="4"
                    />

                    <button
                      type="button"
                      onClick={() => saveEdit(post._id)}
                    >
                      💾 Save Changes
                    </button>

                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="post-content">{post.content}</p>
                )}

                {/* Display Post Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="post-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                {/* Edit and Delete */}
                {isOwner && editingPostId !== post._id && (
                  <div className="post-owner-actions">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post._id)}
                      className="delete-button"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

                {/* Like */}
                <div className="post-actions">
                  <button
                    type="button"
                    className={liked ? "liked-button" : ""}
                    onClick={() => handleLike(post._id)}
                  >
                    {liked ? "❤️ Liked" : "🤍 Like"}
                  </button>

                  <span>{post.likes?.length || 0} Likes</span>
                </div>

                {/* Comments */}
                <div className="comments-section">
                  <h4>💬 Comments</h4>

                  {post.comments?.length > 0 ? (
                    post.comments.map((comment, index) => (
                      <div
                        className="comment"
                        key={comment._id || index}
                      >
                        <strong>
                          {comment.user?.name || "User"}
                        </strong>
                        <p>{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">
                      No comments yet.
                    </p>
                  )}

                  <div className="comment-form">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentTexts[post._id] || ""}
                      onChange={(e) =>
                        setCommentTexts((previous) => ({
                          ...previous,
                          [post._id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() => addComment(post._id)}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Feed;
