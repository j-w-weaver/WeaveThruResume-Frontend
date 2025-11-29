import type { ButtonHTMLAttributes } from "react";

/**
 * Props for Button component.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable Button component.
 *
 * Usage:
 * <Button onClick={handleClick}>Click Me</Button>
 * <Button variant="danger" isLoading={loading}>Delete</Button>
 */
export function Button({
  variant = "primary",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  // Base styles for all buttons
  const baseStyles =
    "px-6 py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant-specific styles
  const variantStyles = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
  };

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
