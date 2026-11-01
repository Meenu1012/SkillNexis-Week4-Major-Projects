# SkillNexis Week 4 — MERN Stack Capstone Projects

A collection of three full-stack web applications developed as part of the SkillNexis Full Stack Development program.

## 🚀 Live Projects

| Project | Live Demo | Status |
|---|---|---|
| ShopNexis — E-Commerce Application | [Open Website](https://skill-nexis-week4-major-projects-gc5w-3ne48kdza-meenakshi8.vercel.app/) | Deployed |
| SocialConnect — Social Media Application | [Open Website](https://socialconnect-lake.vercel.app/) | Deployed |
| Project Management Dashboard | [Open Website](https://project-management-dashboard-kohl-phi.vercel.app/) | Deployed |

## 📌 Project 1: ShopNexis — E-Commerce Web Application

A shopping web application where customers can browse products, manage their cart, and place orders.

### Features
- User registration and login
- Product listing and management
- Shopping cart
- Checkout and order placement
- Customer order history
- Admin dashboard
- Product and order management
- MongoDB data persistence

**Backend:** [ShopNexis API](https://skillnexis-ecommerce-api.onrender.com)

## 📌 Project 2: SocialConnect — Social Media Feed Application

A social networking application for sharing posts and interacting with other users.

### Features
- User registration and login
- Create and manage posts
- Like and comment on posts
- User profiles
- Follow and unfollow users
- Stories
- Notifications
- Image uploads
- MongoDB data persistence

## 📌 Project 3: Project Management Dashboard

A task management application for organizing projects, collaborating with members, and tracking task progress.

### Features
- User registration and login
- Create and manage projects
- Project members and roles
- Create, edit, and delete tasks
- Assign tasks to users
- Task status management
- Kanban-style task columns and drag-and-drop
- Image uploads and previews
- MongoDB data persistence

**Backend:** [Project Management API](https://project-management-api-shbi.onrender.com)

## 🛠️ Technologies Used

- **Frontend:** React, Vite, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), password hashing
- **API:** REST API, Fetch
- **File Uploads:** Multer
- **Deployment:** Vercel, Render
- **Version Control:** Git and GitHub

## 📂 Project Structure

```text
SkillNexis-Week4-Major-Projects/
├── ecommerce-app/
├── Project-2-SocialConnect/
│   ├── backend/
│   └── frontend/
├── frontend/
├── middleware/
├── models/
├── routes/
├── README.md
├── package.json
└── server.js
```

*Note: This is a high-level overview. Actual folders may differ between projects.*

## 💻 Local Setup

### Prerequisites
- Node.js and npm
- MongoDB or a MongoDB Atlas connection
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Meenu1012/SkillNexis-Week4-Major-Projects.git
cd SkillNexis-Week4-Major-Projects
```

### 2. Install dependencies

Open the relevant project folder and install its dependencies:

```bash
npm install
```

Repeat this in the relevant backend and frontend folders if they have separate `package.json` files.

### 3. Configure environment variables

Create a `.env` file in the relevant backend folder using the variable names required by that project's code. Common examples include:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use your own values. Do not commit real credentials or secrets to GitHub.

### 4. Start the application

Run the backend and frontend using the scripts defined in their respective `package.json` files.

## 🖼️ Screenshots

Add screenshots of your deployed applications to a `screenshots/` folder in this repository.

### ShopNexis
![ShopNexis Screenshot](screenshots/ShopNexis-Ecommerce.png)

### SocialConnect
![SocialConnect Screenshot](screenshots/SocialConnect-SocialMedia.png)

### Project Management Dashboard
![Project Management Dashboard Screenshot](screenshots/ProjectManagement-Dashboard.png)

*Replace these screenshot placeholders with actual screenshots saved using the filenames shown above.*

## 🎯 Learning Outcomes

- Building full-stack web applications
- Integrating React frontends with Express APIs
- Implementing authentication and authorization
- Designing REST APIs and MongoDB data models
- Managing application state and user interactions
- Testing, debugging, and deploying web applications
- Using Git and GitHub for version control

## 👩‍💻 Author

**Meenakshi Muthakani**

GitHub: [@Meenu1012](https://github.com/Meenu1012)

## 📄 License

This repository was developed for educational and portfolio purposes as part of the SkillNexis Full Stack Development program.
