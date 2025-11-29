import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { getErrorMessage } from "../utils/api";

/**
 * Login page component.
 *
 * Allows users to log in with email and password.
 */
export function Login() {
  // ============================================
  // HOOKS
  // ============================================

  /**
   * Get auth functions from context.
   * Like dependency injection in C#.
   */
  const { login } = useAuth();

  /**
   * useNavigate hook - for programmatic navigation.
   *
   * C# equivalent:
   * NavigationManager.NavigateTo("/dashboard");
   */
  const navigate = useNavigate();

  // ============================================
  // STATE
  // ============================================

  /**
   * Form fields state.
   * Like having properties with INotifyPropertyChanged in C#.
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Form state.
   */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle form submission.
   *
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission (page refresh)
    e.preventDefault();

    // Clear previous errors
    setError("");

    // Validate
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Call login function from auth context
      await login({ email, password });

      // Success! Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle error
      setError(getErrorMessage(err));
    } finally {
      // Stop loading (runs whether success or error)
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600">
            Sign in to continue to WeavThru Resume
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <Input
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
