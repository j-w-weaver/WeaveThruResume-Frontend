import type { InputHTMLAttributes } from "react";

/**
 * Props for Input component.
 * Extends native HTML input attributes.
 *
 * C# analogy: Like inheriting from a base class
 * public class InputProps : HtmlInputAttributes { ... }
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Reusable Input component with label and error message.
 *
 * Usage:
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 * />
 */
export function Input({ label, error, ...rest }: InputProps) {
  return (
    <div className="mb-4">
      {/* Label */}
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>

      {/* Input field */}
      <input
        {...rest}
        className={`
                    w-full px-3 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${error ? "border-red-500" : "border-gray-300"}
                `}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
}
