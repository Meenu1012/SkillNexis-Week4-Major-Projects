
import { useEffect, useState } from "react";

function Stories({ user }) {
  const [stories, setStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("socialStories")) || [];
    } catch {
      return [];
    }
  });

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [preview, setPreview] = useState(null);

  // Save stories in browser storage
  useEffect(() => {
    try {
      localStorage.setItem("socialStories", JSON.stringify(stories));
    } catch (error) {
      console.error("Unable to save stories:", error);
    }
  }, [stories]);

  // Upload image or video from device
  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      alert("Please select an image or video.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select a file smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview({
        url: reader.result,
        type: file.type.startsWith("video/") ? "video" : "image",
        embed: null
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Convert YouTube links into an embedded video URL
  const getYouTubeEmbed = (url) => {
    try {
      const parsed = new URL(url);
      let videoId = "";

      if (
        parsed.hostname === "youtu.be" ||
        parsed.hostname === "www.youtu.be"
      ) {
        videoId = parsed.pathname.split("/")[1];
      } else if (
        parsed.hostname.includes("youtube.com")
      ) {
        if (parsed.pathname === "/watch") {
          videoId = parsed.searchParams.get("v");
        } else if (
          parsed.pathname.startsWith("/shorts/") ||
          parsed.pathname.startsWith("/embed/")
        ) {
          videoId = parsed.pathname.split("/")[2];
        }
      }

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    } catch {
      return null;
    }
  };

  // Preview pasted URL
  const handlePreview = () => {
    const url = mediaUrl.trim();

    if (!url) {
      alert("Please paste an image or video URL.");
      return;
    }

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid URL");
      }
    } catch {
      alert("Please enter a valid URL.");
      return;
    }

    const embed =
      mediaType === "video" ? getYouTubeEmbed(url) : null;

    setPreview({
      url,
      type: mediaType,
      embed
    });
  };

  // Add story
  const addStory = () => {
    if (!preview) {
      alert("Please upload a file or preview a URL first.");
      return;
    }

    const newStory = {
      id: Date.now(),
      username: user.name,
      url: preview.url,
      image: preview.url,
      type: preview.type,
      embed: preview.embed || null,
      createdAt: new Date().toLocaleString()
    };

    try {
      const updatedStories = [...stories, newStory];

      localStorage.setItem(
        "socialStories",
        JSON.stringify(updatedStories)
      );

      setStories(updatedStories);
      setMediaUrl("");
      setPreview(null);

      alert("Story added successfully!");
    } catch (error) {
      alert("Browser storage is full. Delete old stories or use a smaller file.");
    }
  };

  // Delete selected story
  const deleteStory = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this story?"
    );

    if (confirmDelete) {
      setStories((previous) =>
        previous.filter((story) => story.id !== id)
      );
    }
  };

  // Display image or video
  const showMedia = (story, isPreview = false) => {
    const source = story.url || story.image;

    if (story.type === "video") {
      if (story.embed) {
        return (
          <iframe
            src={story.embed}
            title="Story video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={isPreview ? "preview-media" : "story-video"}
          />
        );
      }

      return (
        <video
          src={source}
          controls
          playsInline
          className={isPreview ? "preview-media" : "story-video"}
        />
      );
    }

    return (
      <img
        src={source}
        alt="Story"
        className={isPreview ? "preview-media" : "story-image"}
      />
    );
  };

  return (
    <section className="stories-section">

      <h3>Stories ✨</h3>

      {/* Upload and Paste URL Side by Side */}
      <div className="story-upload-box">

        <h4>Add Your Story</h4>

        <div className="story-input-row">

          {/* Upload from Device */}
          <div className="story-option">
            <label className="upload-label">
              📁 Upload from Device

              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleUpload}
                hidden
              />
            </label>
          </div>

          {/* Paste URL */}
          <div className="story-option">
            <input
              type="url"
              placeholder="Paste Image / Video URL"
              value={mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setPreview(null);
              }}
            />

            <select
              value={mediaType}
              onChange={(e) => {
                setMediaType(e.target.value);
                setPreview(null);
              }}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

        </div>

        {/* Preview URL */}
        <div className="story-actions">
          <button onClick={handlePreview}>
            Preview URL
          </button>
        </div>

        {/* Media Preview */}
        {preview && (
          <div className="story-preview">

            <h4>Story Preview</h4>

            {showMedia(preview, true)}

            <div className="preview-buttons">
              <button onClick={addStory}>
                ＋ Post Story
              </button>

              <button onClick={() => setPreview(null)}>
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Stories List */}
      <div className="stories-list">

        <div className="story-card">
          <div className="add-story-circle">+</div>
          <p>Your Story</p>
        </div>

        {stories.map((story) => (
          <div className="story-card" key={story.id}>

            {showMedia(story)}

            <p>{story.username}</p>

            {story.username === user.name && (
              <button
                className="delete-story"
                onClick={() => deleteStory(story.id)}
              >
                Delete
              </button>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}

export default Stories;
