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