import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { getErrorMessage } from "../utils/api";

/**
 * Registration page component.
 *
 * Allows new users to create an account.
 */
export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Validate form fields.
   *
   * @returns true if valid, false otherwise
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setError("");
    setFieldErrors({});

    // Validate
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call register function from auth context
      await register({ name, email, password });

      // Success! Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account 🚀
          </h1>
          <p className="text-gray-600">Join WeavThru Resume today</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />

          {/* Email Input */}
          <Input
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />

          {/* Confirm Password Input */}
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
