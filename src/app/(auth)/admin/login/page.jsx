"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput } from "@/components/common/FormInput";

function validate(values) {
  const errors = {};
  if (!values.email) errors.email = "Email address is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address";
  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  return errors;
}

export default function AdminLoginPage() {
  const { login } = useAdminAuth();

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
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");
    try {
      await login({ email: values.email, password: values.password });
    } catch (err) {
      setServerError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-1">Sign in</h2>
      <p className="text-[13px] text-white/50 mb-6">Access the administration panel.</p>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <AlertIcon size={14} />
          <p className="text-sm text-red-400 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email" error={fieldError("email")}>
          <FormInput
            id="email" name="email" type="email" autoComplete="email"
            placeholder="admin@example.com" value={values.email}
            onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("email"))}
          />
        </FormField>

        <FormField label="Password" error={fieldError("password")}>
          <div className="relative">
            <FormInput
              id="password" name="password"
              type={showPassword ? "text" : "password"} autoComplete="current-password"
              placeholder="••••••••" value={values.password}
              onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("password"))} className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end pt-1">
          <Link
            href="/admin/forgot-password"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              {Spinner}
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
