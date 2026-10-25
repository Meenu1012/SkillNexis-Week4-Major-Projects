# Full Stack Task Manager — Week 3

A full-stack task management application developed for the SkillNexis Full Stack Development Week 3 assignment.

## Features

- User registration and login
- JWT authentication
- Create, view, edit, and delete tasks
- Filter tasks by status
- Upload and preview images
- MongoDB database integration
- React frontend with an Express.js backend

## Technologies Used

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JSON Web Tokens (JWT)
- Image Upload: Multer

## Project Structure

- `frontend/` — React application
- `models/` — MongoDB models
- `middleware/` — Authentication middleware
- `routes/` — Authentication, task, and upload routes
- `uploads/` — Locally uploaded images
- `server.js` — Backend entry point

## Setup

### 1. Install backend dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Replace the example values with your own credentials. Never commit `.env` to GitHub.

### 3. Start the backend

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 4. Install and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL printed in your terminal, usually `http://localhost:5173`.

## API

- `GET /` — API welcome message
- `GET /api/health` — Health check
- `POST /api/auth/register` — Register an account
- `POST /api/auth/login` — Log in
- `POST /api/uploads` — Upload an image

See `routes/tasks.js` for the implemented task endpoints.

## Learning Outcomes

- REST API development
- MongoDB integration
- User authentication
- Task CRUD operations
- Image upload handling
- React and backend integration

## Author

Meenakshi Muthakani

## Project Status

SkillNexis Week 3 Full Stack Development Assignment.
