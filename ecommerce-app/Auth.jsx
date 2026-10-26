
import { useState } from "react";
import { apiRequest } from "./api";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const path = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      localStorage.setItem("ecommerceToken", data.token);
      localStorage.setItem(
        "ecommerceUser",
        JSON.stringify(data.user)
      );

      onLogin(data.user, data.token);
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <p className="eyebrow">SHOPNEXIS ACCOUNT</p>

        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>

        <p>
          {isRegister
            ? "Register to start shopping."
            : "Login to access your shopping account."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to ShopNexis?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default Auth;
