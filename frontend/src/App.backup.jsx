
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
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("personal");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignedTo, setAssignedTo] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  async function loadProjects(activeToken = token) {
    if (!activeToken) return;

    const data = await apiRequest("/api/projects", {}, activeToken);
    const projectList = Array.isArray(data)
      ? data
      : data.projects || [];

    setProjects(projectList);
  }

  async function loadTasks(
    activeToken = token,
    projectId = selectedProject
  ) {
    if (!activeToken) return;

    const query =
      projectId === "personal"
        ? ""
        : `?project=${encodeURIComponent(projectId)}`;

    const data = await apiRequest(
      `/api/tasks${query}`,
      {},
      activeToken
    );

    let taskList = Array.isArray(data)
      ? data
      : data.tasks || [];

    if (projectId === "personal") {
      taskList = taskList.filter(task => !task.project);
    }

    setTasks(taskList);
  }

  useEffect(() => {
    if (!token) return;

    loadProjects(token).catch(error => {
      setMessage(`Projects: ${error.message}`);
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    loadTasks(token, selectedProject).catch(error => {
      setMessage(`Tasks: ${error.message}`);
    });
  }, [token, selectedProject]);

  function handleLogin(newToken, newUser) {
    localStorage.setItem("taskManagerToken", newToken);
    localStorage.setItem(
      "taskManagerUser",
      JSON.stringify(newUser || null)
    );

    setToken(newToken);
    setUser(newUser || null);
    setMessage("Login successful!");
  }

  async function createProject(event) {
    event.preventDefault();

    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    try {
      const data = await apiRequest(
        "/api/projects",
        {
          method: "POST",
          body: JSON.stringify({
            name: projectName.trim(),
            description: projectDescription.trim()
          })
        },
        token
      );

      const newProject = data.project;

      setProjectName("");
      setProjectDescription("");

      await loadProjects(token);

      if (newProject?._id) {
        setSelectedProject(newProject._id);
      }

      setMessage(data.message || "Project created successfully!");
    } catch (error) {
      setMessage(`Create project failed: ${error.message}`);
    }
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        project:
          selectedProject === "personal"
            ? null
            : selectedProject,
        assignedTo: assignedTo.trim() || null
      };

      const data = await apiRequest(
        "/api/tasks",
        {
          method: "POST",
          body: JSON.stringify(taskData)
        },
        token
      );

      setTitle("");
      setDescription("");
      setStatus("pending");
      setAssignedTo("");

      await loadTasks(token, selectedProject);
      setMessage(data.message || "Task created successfully!");
    } catch (error) {
      setMessage(`Create task failed: ${error.message}`);
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

      await loadTasks(token, selectedProject);
      setMessage("Task updated successfully!");
    } catch (error) {
      setMessage(`Update task failed: ${error.message}`);
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

      await loadTasks(token, selectedProject);
      setMessage("Task deleted successfully!");
    } catch (error) {
      setMessage(`Delete task failed: ${error.message}`);
    }
  }

  async function handleDrop(nextStatus) {
    if (!draggedTask || draggedTask.status === nextStatus) {
      setDraggedTask(null);
      return;
    }

    const task = draggedTask;
    setDraggedTask(null);

    await updateTask(task._id, { status: nextStatus });
  }

  function handleImageSelection(event) {
    const file = event.target.files?.[0] || null;

    setSelectedImage(file);
    setUploadedImage("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setUploadedImage(
        data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `${API_URL}${data.imageUrl}`
      );

      setMessage(data.message || "Image uploaded successfully!");
    } catch (error) {
      setMessage(`Image upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function refreshWorkspace() {
    setMessage("Refreshing workspace...");

    try {
      await Promise.all([
        loadProjects(token),
        loadTasks(token, selectedProject)
      ]);

      setMessage("Workspace refreshed successfully.");
    } catch (error) {
      setMessage(`Workspace refresh failed: ${error.message}`);
    }
  }

  function logout() {
    localStorage.removeItem("taskManagerToken");
    localStorage.removeItem("taskManagerUser");

    setToken("");
    setUser(null);
    setTasks([]);
    setProjects([]);
    setSelectedProject("personal");
    setMessage("");
  }

  const currentProject = projects.find(
    project => project._id === selectedProject
  );

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">PROJECT WORKSPACE</p>
          <h1>Project Management Dashboard</h1>
          <p className="welcome">
            Welcome, {user?.name || "there"}! Organize your work.
          </p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <strong>
            {tasks.filter(task => task.status === "pending").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>In progress</span>
          <strong>
            {tasks.filter(task => task.status === "in-progress").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>
            {tasks.filter(task => task.status === "completed").length}
          </strong>
        </div>
      </section>

      <section className="panel">
        <h2>Create a project</h2>

        <form className="task-form" onSubmit={createProject}>
          <input
            placeholder="Project name"
            value={projectName}
            onChange={event => setProjectName(event.target.value)}
            required
          />

          <textarea
            placeholder="Project description (optional)"
            value={projectDescription}
            onChange={event => setProjectDescription(event.target.value)}
          />

          <button type="submit">+ Create project</button>
        </form>
      </section>

      <section className="panel">
        <h2>Select workspace</h2>

        <label htmlFor="project-select">Show tasks for:</label>

        <select
          id="project-select"
          value={selectedProject}
          onChange={event => setSelectedProject(event.target.value)}
        >
          <option value="personal">Personal tasks</option>

          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        <p>
          {currentProject
            ? currentProject.description || "No project description."
            : "Create personal tasks or select a project to organize team work."}
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={refreshWorkspace}
        >
          Refresh workspace
        </button>
      </section>

      {message && <p className="message">{message}</p>}

      <section className="panel">
        <h2>Create a task</h2>

        <form className="task-form" onSubmit={handleTaskSubmit}>
          <input
            placeholder="Task title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />

          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
          >
            {columns.map(column => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Assignee email (optional)"
            value={assignedTo}
            onChange={event => setAssignedTo(event.target.value)}
          />

          <p className="form-hint">
            The assignee must already have an account. For project tasks,
            they must also be a member of the selected project.
          </p>

          <button type="submit">+ Add task</button>
        </form>
      </section>

      <section className="board-heading">
        <div>
          <h2>
            {currentProject ? currentProject.name : "My personal board"}
          </h2>
          <p>Drag a task card into another column to update its status.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={async () => {
            try {
              await loadTasks(token, selectedProject);
              setMessage("Tasks refreshed successfully.");
            } catch (error) {
              setMessage(`Tasks refresh failed: ${error.message}`);
            }
          }}
        >
          Refresh tasks
        </button>
      </section>

      <section className="kanban-board">
        {columns.map(column => {
          const columnTasks = tasks.filter(
            task => task.status === column.id
          );

          return (
            <div
              className={`kanban-column ${column.color}`}
              key={column.id}
              onDragOver={event => event.preventDefault()}
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

                  <p>
                    {task.description || "No description provided."}
                  </p>

                  <p className="task-assignee">
                    <strong>Assigned to:</strong>{" "}
                    {task.assignedTo?.name
                      ? `${task.assignedTo.name} (${task.assignedTo.email})`
                      : task.assignedTo?.email || "Unassigned"}
                  </p>

                  <label className="status-label">Change status</label>

                  <select
                    value={task.status}
                    onChange={event =>
                      updateTask(task._id, {
                        status: event.target.value
                      })
                    }
                  >
                    {columns.map(columnOption => (
                      <option
                        key={columnOption.id}
                        value={columnOption.id}
                      >
                        {columnOption.title}
                      </option>
                    ))}
                  </select>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => {
                        const newTitle = window.prompt(
                          "New task title:",
                          task.title
                        );

                        if (newTitle?.trim()) {
                          updateTask(task._id, {
                            title: newTitle.trim()
                          });
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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelection}
          />

          {previewUrl && (
            <img
              className="preview"
              src={previewUrl}
              alt="Selected preview"
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload image"}
          </button>
        </form>

        {uploadedImage && (
          <img
            className="preview"
            src={uploadedImage}
            alt="Uploaded file"
          />
        )}
      </section>
    </main>
  );
}

export default App;
