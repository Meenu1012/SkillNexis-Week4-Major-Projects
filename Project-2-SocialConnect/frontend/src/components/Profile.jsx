
import { useEffect, useState } from "react";
import API from "../api";

function Profile({ user, onBack, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await API.get("/auth/profile");

        setName(response.data.user.name || "");
        setBio(response.data.user.bio || "");
        setProfilePicture(response.data.user.profilePicture || "");
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Could not load profile."
        );
      }
    };

    getProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.put("/auth/profile", {
        name,
        bio,
        profilePicture,
      });

      setMessage("Profile updated successfully!");

      if (onProfileUpdate) {
        onProfileUpdate(response.data.user);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Profile update failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength="200"
          placeholder="Write something about yourself..."
        />

        <label>Profile Picture URL</label>
        <input
          type="url"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="Enter an image URL"
        />

        {profilePicture && (
          <img
            src={profilePicture}
            alt="Profile"
            width="100"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <button onClick={onBack}>Back to Feed</button>
    </div>
  );
}

export default Profile;
