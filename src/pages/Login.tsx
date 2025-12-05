import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0F19",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          background: "#161B26",
          padding: "40px",
          borderRadius: "12px",
          border: "1px solid #2D3748",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div className="nav-icon" style={{ margin: "0 auto 16px" }}>
            FR
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#F7F4ED",
              marginBottom: "8px",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#C9C5BA" }}>Sign in to continue to Resume</p>
        </div>

        {error && (
          <div
            style={{
              background: "#7F1D1D",
              color: "#FEE2E2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#F7F4ED",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0B0F19",
                border: "1px solid #2D3748",
                borderRadius: "8px",
                color: "#F7F4ED",
                fontSize: "14px",
              }}
              placeholder="your.email@example.com"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                color: "#F7F4ED",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0B0F19",
                border: "1px solid #2D3748",
                borderRadius: "8px",
                color: "#F7F4ED",
                fontSize: "14px",
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-large"
            style={{ width: "100%" }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "#C9C5BA",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#5B9FFF",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
