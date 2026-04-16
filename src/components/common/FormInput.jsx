"use client";

import { AlertIcon } from "./SvgIcon";

export function FormField({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-[13px] font-medium text-white/80 mb-1.5">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertIcon size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

export function inputClass(hasError) {
  return [
    "w-full rounded-lg border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition",
    "placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
      : "border-transparent focus:border-white/30 focus:ring-white/10",
  ].join(" ");
}

export function FormInput({
  type = "text",
  name,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  hasError,
  className = "",
  ...props
}) {
  return (
    <input
      id={id || name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`${inputClass(hasError)} ${className}`.trim()}
      {...props}
    />
  );
}

export function validateLogin(values) {
  const errors = {};
  if (!values.email) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

export function validateRegistration(values) {
  const errors = {};
  if (!values.firstName || values.firstName.trim().length < 2)
    errors.firstName = "First name must be at least 2 characters";
  if (!values.lastName || values.lastName.trim().length < 2)
    errors.lastName = "Last name must be at least 2 characters";
  if (!values.email)
    errors.email = "Email address is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address";
  if (!values.password)
    errors.password = "Password is required";
  else if (values.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (!values.confirmPassword)
    errors.confirmPassword = "Please confirm your password";
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords do not match";
  if (!values.terms)
    errors.terms = "You must accept the terms to continue";
  return errors;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}