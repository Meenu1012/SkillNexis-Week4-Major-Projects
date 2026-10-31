import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import Stories from "./components/Stories";
import Users from "./components/Users";
import Notifications from "./components/Notifications";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("socialUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("socialUser", JSON.stringify(userData));
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem("socialUser", JSON.stringify(userData));
  };

  const handleProfileUpdate = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };

    setUser(newUser);
    localStorage.setItem("socialUser", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("socialToken");
    localStorage.removeItem("socialUser");

    setUser(null);
    setShowProfile(false);
    setShowRegister(false);
  };

  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <Register
            onRegister={handleRegister}
            onLoginClick={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onRegisterClick={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SocialConnect</h1>

        <div className="header-user">
          <span>Welcome, {user.name}</span>

          <button onClick={() => setShowProfile(!showProfile)}>
            {showProfile ? "Feed" : "My Profile"}
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {showProfile ? (
          <Profile
            user={user}
            onBack={() => setShowProfile(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        ) : (
          <>
            <h2>Hello, {user.name}! 👋</h2>

            <p>Welcome to your social community.</p>

            {/* Stories */}
            <Stories user={user} />

            {/* Notifications */}
            <Notifications />

            {/* Find People */}
            <Users user={user} />

            {/* Social Feed */}
            <Feed user={user} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
