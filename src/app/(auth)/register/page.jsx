"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values) {
  const errors = {};

  if (!values.firstName || values.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!values.lastName || values.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!values.email) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!values.terms) {
    errors.terms = "You must accept the terms to continue";
  }

  return errors;
}

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(password) {
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

// ─── Icons ────────────────────────────────────────────────────────────────────

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
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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

// ─── Field wrapper ─────────────────────────────────────────────────────────────

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

function inputClass(hasError) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition",
    "placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 bg-gray-50 focus:border-[#403DCE] focus:ring-[#403DCE]/10",
  ].join(" ");
}

// ─── Password field with show/hide toggle ─────────────────────────────────────

function PasswordInput({ id, name, value, onChange, onBlur, placeholder, hasError, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${inputClass(hasError)} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

export default function RegisterPage() {
  const { register } = useAuth();

  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(values.password);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
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

    // Touch all fields
    const allFields = Object.keys(INITIAL).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allFields);

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");

    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email,
        password: values.password,
      });
      // Redirect is handled inside register() via router.push
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="font-playfair text-[2rem] font-bold text-gray-900 leading-tight">
          Create an account
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Join Human Concern USA and start making an impact
        </p>
      </div>

      {/* Server error banner */}
      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <AlertIcon size={16} />
          <p className="text-sm text-red-600 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={fieldError("firstName")}>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="John"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass(Boolean(fieldError("firstName")))}
            />
          </Field>

          <Field label="Last name" error={fieldError("lastName")}>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass(Boolean(fieldError("lastName")))}
            />
          </Field>
        </div>

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
        <Field label="Password" error={fieldError("password")}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={Boolean(fieldError("password"))}
          />
          {/* Strength meter (only when user has started typing) */}
          {values.password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((segment) => (
                  <div
                    key={segment}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      strength.score >= segment
                        ? strength.color
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="mt-1 text-xs text-gray-400">
                  Strength:{" "}
                  <span
                    className={
                      strength.score <= 1
                        ? "text-red-500"
                        : strength.score <= 2
                        ? "text-orange-500"
                        : strength.score <= 3
                        ? "text-yellow-600"
                        : "text-emerald-600"
                    }
                  >
                    {strength.label}
                  </span>
                </p>
              )}
            </div>
          )}
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm password" error={fieldError("confirmPassword")}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={Boolean(fieldError("confirmPassword"))}
          />
        </Field>

        {/* Terms checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={values.terms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#403DCE] accent-[#403DCE] cursor-pointer"
            />
            <span className="text-sm text-gray-600 leading-snug">
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-[#403DCE] hover:text-[#201F68] transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-[#403DCE] hover:text-[#201F68] transition-colors"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {fieldError("terms") && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
              <AlertIcon size={12} />
              {errors.terms}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background:
              "linear-gradient(103.99deg, #403DCE 5.42%, #201F68 83.13%)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#403DCE] hover:text-[#201F68] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
