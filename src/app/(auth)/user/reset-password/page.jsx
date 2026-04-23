"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertIcon, EyeIcon, EyeOffIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput, getPasswordStrength } from "@/components/common/FormInput";
import { resetPassword } from "@/services/authService";

function validate(values) {
  const errors = {};
  if (!values.newPassword) errors.newPassword = "Password is required";
  else if (values.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [values, setValues] = useState({ newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(values.newPassword);

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
    setTouched({ newPassword: true, confirmPassword: true });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");
    try {
      await resetPassword({ token, newPassword: values.newPassword });
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  if (!token) {
    return (
      <div className="text-center py-4">
        <h2 className="text-[22px] font-semibold text-white mb-2">Invalid link</h2>
        <p className="text-sm text-white/60 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/user/forgot-password" className="text-[13px] text-white/80 font-medium hover:text-white transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-[22px] font-semibold text-white mb-2">Password updated</h2>
        <p className="text-sm text-white/60 mb-6">Your password has been reset successfully.</p>
        <Link href="/user/login" className="text-[13px] text-white/80 font-medium hover:text-white transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-1">Set new password</h2>
      <p className="text-[13px] text-white/60 mb-6">Choose a strong password for your account.</p>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <AlertIcon size={14} />
          <p className="text-sm text-red-400 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="New password" error={fieldError("newPassword")}>
          <div className="relative">
            <FormInput
              id="newPassword" name="newPassword"
              type={showPassword ? "text" : "password"} autoComplete="new-password"
              placeholder="Min. 8 characters" value={values.newPassword}
              onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("newPassword"))} className="pr-11"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
          {values.newPassword.length > 0 && (
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

        <FormField label="Confirm password" error={fieldError("confirmPassword")}>
          <div className="relative">
            <FormInput
              id="confirmPassword" name="confirmPassword"
              type={showConfirm ? "text" : "password"} autoComplete="new-password"
              placeholder="Re-enter your password" value={values.confirmPassword}
              onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("confirmPassword"))} className="pr-11"
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}>
              {showConfirm ? EyeOffIcon : EyeIcon}
            </button>
          </div>
        </FormField>

        <button type="submit" disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">{Spinner}Updating…</span>
          ) : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm">Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
