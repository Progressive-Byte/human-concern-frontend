"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(values) {
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

// ─── Icons ───────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
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
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertIcon size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input class helper ───────────────────────────────────────────────────────

function inputClass(hasError) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition",
    "placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 bg-gray-50 focus:border-[#403DCE] focus:ring-[#403DCE]/10",
  ].join(" ");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();

  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Touch all fields to reveal any hidden errors
    const allTouched = { email: true, password: true };
    setTouched(allTouched);

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");

    try {
      await login({ email: values.email, password: values.password });
      // Redirect is handled inside login() via router.push
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => touched[name] ? errors[name] : undefined;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-playfair text-[2rem] font-bold text-gray-900 leading-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Sign in to your account to continue
        </p>
      </div>

      {/* Server / API error banner */}
      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <AlertIcon size={16} />
          <p className="text-sm text-red-600 leading-snug">{serverError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <Field label="Email address" error={fieldError("email")}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(Boolean(fieldError("email")))}
          />
        </Field>

        {/* Password */}
        <Field label={
          <span className="flex items-center justify-between w-full">
            <span>Password</span>
            <Link
              href="/forgot-password"
              tabIndex={-1}
              className="text-xs font-medium text-[#403DCE] hover:text-[#201F68] transition-colors"
            >
              Forgot password?
            </Link>
          </span>
        } error={fieldError("password")}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputClass(Boolean(fieldError("password")))} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background:
              "linear-gradient(103.99deg, #403DCE 5.42%, #201F68 83.13%)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#403DCE] hover:text-[#201F68] transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
