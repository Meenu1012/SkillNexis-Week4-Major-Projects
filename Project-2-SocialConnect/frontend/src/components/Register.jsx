
import { useState } from "react";
import API from "../api";

function Register({ onRegister, onLoginClick }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("socialToken", response.data.token);
      localStorage.setItem("socialUser", JSON.stringify(response.data.user));

      onRegister(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Create Account</h1>
      <p>Join our SocialConnect community.</p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="link-button"
          onClick={onLoginClick}
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;
