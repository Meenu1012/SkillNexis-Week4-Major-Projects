
import { useEffect, useState } from "react";
import API from "../api";

function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUser, setBusyUser] = useState("");

  const currentUserId = user?._id || user?.id;

  const loadUsers = async () => {
    try {
      const response = await API.get("/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleFollow = async (person) => {
    const personId = person._id;

    const isFollowing = person.followers?.some(
      (id) => String(id?._id || id) === String(currentUserId)
    );

    try {
      setBusyUser(personId);

      if (isFollowing) {
        await API.delete(`/users/${personId}/follow`);
      } else {
        await API.post(`/users/${personId}/follow`);
      }

      await loadUsers();
    } catch (err) {
      alert(
        err.response?.data?.message || "Follow action failed"
      );
    } finally {
      setBusyUser("");
    }
  };

  if (loading) {
    return <p>Loading people...</p>;
  }

  return (
    <section className="users-section">
      <h2>👥 Find People</h2>

      <p>Discover people and grow your SocialConnect community.</p>

      {error && <p className="error-message">{error}</p>}

      {users.length === 0 ? (
        <p>No other users registered yet. Invite friends to join!</p>
      ) : (
        <div className="users-grid">
          {users.map((person) => {
            const isFollowing = person.followers?.some(
              (id) => String(id?._id || id) === String(currentUserId)
            );

            return (
              <div className="user-card" key={person._id}>
                <div className="user-avatar">
                  {person.profilePicture ? (
                    <img
                      src={person.profilePicture}
                      alt={person.name}
                    />
                  ) : (
                    person.name?.charAt(0).toUpperCase()
                  )}
                </div>

                <h3>{person.name}</h3>

                <p>
                  {person.bio || "Welcome to SocialConnect!"}
                </p>

                <div className="follow-counts">
                  <span>
                    <strong>
                      {person.followers?.length || 0}
                    </strong>
                    Followers
                  </span>

                  <span>
                    <strong>
                      {person.following?.length || 0}
                    </strong>
                    Following
                  </span>
                </div>

                <button
                  className={
                    isFollowing ? "unfollow-btn" : "follow-btn"
                  }
                  onClick={() => toggleFollow(person)}
                  disabled={busyUser === person._id}
                >
                  {busyUser === person._id
                    ? "Please wait..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Users;
