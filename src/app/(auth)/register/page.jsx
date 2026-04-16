"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, GoogleIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput, getPasswordStrength, validateRegistration } from "@/components/common/FormInput";

const INITIAL = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "", terms: false };

export default function RegisterPage() {
  const { register } = useAuth();

  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(values.password);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(next);
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateRegistration(next)[name] }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateRegistration(values)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allFields = Object.keys(INITIAL).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allFields);
    const errs = validateRegistration(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");
    try {
      await register({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), email: values.email, password: values.password });
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <div>
      {/* Heading */}
      <h2 className="text-[22px] font-semibold text-white mb-6">
        Create an account
      </h2>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <AlertIcon size={14} />
          <p className="text-sm text-red-400 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" error={fieldError("firstName")}>
            <FormInput
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="John"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              hasError={Boolean(fieldError("firstName"))}
            />
          </FormField>
          <FormField label="Last name" error={fieldError("lastName")}>
            <FormInput
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              hasError={Boolean(fieldError("lastName"))}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Email" error={fieldError("email")}>
          <FormInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={Boolean(fieldError("email"))}
          />
        </FormField>

        {/* Password */}
        <FormField label="Password" error={fieldError("password")}>
          <div className="relative">
            <FormInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              hasError={Boolean(fieldError("password"))}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                EyeIcon
              ) : (
                EyeOffIcon
              )}
            </button>
          </div>
          {values.password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div key={seg} className={`flex-1 rounded-full transition-all duration-300 ${strength.score >= seg ? strength.color : "bg-white/10"}`} />
                ))}
              </div>
              {strength.label && (
                <p className="mt-1 text-xs text-white/40">
                  Strength:{" "}
                  <span className={strength.score <= 1 ? "text-red-400" : strength.score <= 2 ? "text-orange-400" : strength.score <= 3 ? "text-yellow-400" : "text-emerald-400"}>
                    {strength.label}
                  </span>
                </p>
              )}
            </div>
          )}
        </FormField>

        {/* Confirm password */}
        <FormField label="Confirm password" error={fieldError("confirmPassword")}>
          <div className="relative">
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              hasError={Boolean(fieldError("confirmPassword"))}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                EyeIcon
              ) : (
                EyeOffIcon
              )}
            </button>
          </div>
        </FormField>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input id="terms" name="terms" type="checkbox" checked={values.terms}
              onChange={handleChange} onBlur={handleBlur}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 text-[#EA3335] accent-[#EA3335] cursor-pointer"
            />
            <span className="text-[13px] text-white/60 leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-white/80 hover:text-white font-medium transition-colors">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-white/80 hover:text-white font-medium transition-colors">Privacy Policy</Link>
            </span>
          </label>
          {fieldError("terms") && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <AlertIcon />
              {errors.terms}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2"><Spinner />Creating account…</span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google sign-up */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-[14px] font-medium text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {GoogleIcon}
        Sign up with Google
      </button>

      {/* Login link */}
      <p className="text-center text-[13px] text-white/50 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-white/80 font-medium hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
