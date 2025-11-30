import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
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
            W
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#F7F4ED",
              marginBottom: "8px",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "#C9C5BA" }}>
            Start optimizing your resume with AI
          </p>
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0B0F19",
                border: "1px solid #2D3748",
                borderRadius: "8px",
                color: "#F7F4ED",
                fontSize: "14px",
              }}
              placeholder="Your name"
            />
          </div>

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
              placeholder="At least 6 characters"
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
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0B0F19",
                border: "1px solid #2D3748",
                borderRadius: "8px",
                color: "#F7F4ED",
                fontSize: "14px",
              }}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-large"
            style={{ width: "100%" }}
          >
            {isLoading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#5B9FFF",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
