
import { useState } from "react";
import API from "../api";

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("socialToken", response.data.token);
      localStorage.setItem(
        "socialUser",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-card">
      <h1>Welcome Back!</h1>
      <p>Login to your social community</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account?{" "}
        <button type="button" className="link-button" onClick={onSwitch}>
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;
