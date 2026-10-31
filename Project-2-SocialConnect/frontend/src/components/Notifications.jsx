
import { useEffect, useState } from "react";
import API from "../api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      alert("Unable to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      loadNotifications();
    } catch (err) {
      alert("Unable to update notifications");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      loadNotifications();
    } catch (err) {
      alert("Unable to delete notification");
    }
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <section className="notifications-section">
      <div className="notifications-header">
        <h2>🔔 Notifications</h2>

        {notifications.some((item) => !item.isRead) && (
          <button onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((item) => (
          <div
            className={`notification-card ${
              item.isRead ? "read" : "unread"
            }`}
            key={item._id}
          >
            <div className="notification-avatar">
              {item.sender?.profilePicture ? (
                <img
                  src={item.sender.profilePicture}
                  alt={item.sender.name}
                />
              ) : (
                item.sender?.name?.charAt(0).toUpperCase() || "?"
              )}
            </div>

            <div className="notification-content">
              <strong>{item.sender?.name || "Someone"}</strong>
              <p>{item.message}</p>
              <small>
                {new Date(item.createdAt).toLocaleString()}
              </small>

              {!item.isRead && (
                <button onClick={() => markAsRead(item._id)}>
                  Mark as read
                </button>
              )}

              <button onClick={() => deleteNotification(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default Notifications;
