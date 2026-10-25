
import { useEffect, useState } from "react";
import Auth from "./Auth";
import { apiRequest, API_URL } from "./api";
import "./App.css";

const columns = [
  { id: "pending", title: "Pending", color: "pending" },
  { id: "in-progress", title: "In Progress", color: "progress" },
  { id: "completed", title: "Completed", color: "completed" }
];

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("taskManagerToken") || ""
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskManagerUser")) || null;
    } catch {
      return null;
    }
  });

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  async function loadTasks(activeToken = token) {
    if (!activeToken) return;

    try {
      const data = await apiRequest("/api/tasks", {}, activeToken);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (token) loadTasks(token);
  }, [token]);

  function handleLogin(newToken, newUser) {
    localStorage.setItem("taskManagerToken", newToken);
    localStorage.setItem("taskManagerUser", JSON.stringify(newUser || null));
    setToken(newToken);
    setUser(newUser || null);
    setMessage("Login successful!");
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      await apiRequest(
        "/api/tasks",
        {
          method: "POST",
          body: JSON.stringify({ title, description, status })
        },
        token
      );

      setTitle("");
      setDescription("");
      setStatus("pending");
      setMessage("Task created successfully!");
      await loadTasks(token);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateTask(taskId, updates) {
    try {
      await apiRequest(
        `/api/tasks/${taskId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates)
        },
        token
      );
      await loadTasks(token);
      setMessage("Task updated successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    try {
      await apiRequest(
        `/api/tasks/${taskId}`,
        { method: "DELETE" },
        token
      );
      await loadTasks(token);
      setMessage("Task deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDrop(status) {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    const task = draggedTask;
    setDraggedTask(null);
    await updateTask(task._id, { status });
  }

  function handleImageSelection(event) {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
    setUploadedImage("");

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  async function handleImageUpload(event) {
    event.preventDefault();

    if (!selectedImage) {
      setMessage("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed.");

      setUploadedImage(
        data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `${API_URL}${data.imageUrl}`
      );
      setMessage(data.message || "Image uploaded successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("taskManagerToken");
    localStorage.removeItem("taskManagerUser");
    setToken("");
    setUser(null);
    setTasks([]);
    setMessage("");
  }

  if (!token) return <Auth onLogin={handleLogin} />;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Project Management</h1>
          <p className="welcome">
            Welcome, {user?.name || "there"}! Organize your work.
          </p>
        </div>
        <button className="logout-button" onClick={logout}>Logout</button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="summary-card">
          <span>Pending</span>
          <strong>{tasks.filter(t => t.status === "pending").length}</strong>
        </div>
        <div className="summary-card">
          <span>In progress</span>
          <strong>{tasks.filter(t => t.status === "in-progress").length}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span>
          <strong>{tasks.filter(t => t.status === "completed").length}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Create a task</h2>
        <form className="task-form" onSubmit={handleTaskSubmit}>
          <input
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {columns.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button type="submit">+ Add task</button>
        </form>
      </section>

      {message && <p className="message">{message}</p>}

      <section className="board-heading">
        <div>
          <h2>My board</h2>
          <p>Drag a task card into another column to update its status.</p>
        </div>
        <button className="secondary-button" onClick={() => loadTasks(token)}>
          Refresh
        </button>
      </section>

      <section className="kanban-board">
        {columns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div
              className={`kanban-column ${column.color}`}
              key={column.id}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="column-heading">
                <h3>{column.title}</h3>
                <span className="task-count">{columnTasks.length}</span>
              </div>

              {columnTasks.length === 0 && (
                <p className="empty-column">Drop tasks here</p>
              )}

              {columnTasks.map(task => (
                <article
                  className="task-card"
                  key={task._id}
                  draggable
                  onDragStart={() => setDraggedTask(task)}
                  onDragEnd={() => setDraggedTask(null)}
                >
                  <div className="card-label">TASK</div>
                  <h4>{task.title}</h4>
                  <p>{task.description || "No description provided."}</p>

                  <label className="status-label">Change status</label>
                  <select
                    value={task.status}
                    onChange={e => updateTask(task._id, { status: e.target.value })}
                  >
                    {columns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => {
                        const newTitle = window.prompt("New task title:", task.title);
                        if (newTitle?.trim()) {
                          updateTask(task._id, { title: newTitle.trim() });
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          );
        })}
      </section>

      <section className="panel upload-panel">
        <h2>Image upload</h2>
        <p>Choose an image to preview and upload.</p>
        <form onSubmit={handleImageUpload}>
          <input type="file" accept="image/*" onChange={handleImageSelection} />
          {previewUrl && (
            <img className="preview" src={previewUrl} alt="Selected preview" />
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload image"}
          </button>
        </form>
        {uploadedImage && (
          <img className="preview" src={uploadedImage} alt="Uploaded file" />
        )}
      </section>
    </main>
  );
}

export default App;
