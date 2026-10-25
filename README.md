# SkillNexis Week 4 — Full Stack Major Projects

A collection of full-stack web applications developed as part of the SkillNexis Full Stack Development program.

## Projects

### 1. E-Commerce Web Application
**Status:** Planned

Planned features:
- Product listing and product details
- User registration and login
- Shopping cart and order management
- Admin dashboard for product management

### 2. Social Media Feed Application
**Status:** Planned

Planned features:
- User registration and login
- Create and view posts
- Like and comment on posts
- Optional real-time updates

### 3. Project Management Dashboard
**Status:** In progress

Features implemented:
- User registration and login with JWT authentication
- Create and manage projects
- Project members and roles
- Create, edit, delete, and assign tasks
- Task status management and Kanban drag-and-drop
- Image uploads and previews
- MongoDB data persistence

## Technologies Used

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer

## Project Structure

```text
SkillNexis-Week4-Major-Projects/
├── frontend/
├── middleware/
├── models/
├── routes/
├── server.js
├── package.json
└── README.md
```

## How to Run Project 3

### Prerequisites
- Node.js and npm
- MongoDB connection string

### 1. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Use your own values. Never upload `.env` or expose credentials publicly.

### 2. Install backend dependencies

```bash
npm install
```

### 3. Start the backend

```bash
npm run dev
```

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown in the terminal.

## Learning Outcomes

- Full-stack application development
- REST API development
- Authentication and authorization
- MongoDB integration
- Task and project management
- File uploads and persistence
- React frontend and Express backend integration

## Author

Meenakshi Muthakani

## Project Status

The Project Management Dashboard is the current implementation. The E-Commerce and Social Media applications will be added as they are developed.
