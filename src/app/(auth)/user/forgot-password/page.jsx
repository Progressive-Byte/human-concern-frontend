"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput } from "@/components/common/FormInput";
import { requestPasswordReset } from "@/services/authService";

function validateEmail(value) {
  if (!value) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
  return "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setEmail(e.target.value);
    if (touched) setError(validateEmail(e.target.value));
  }

  function handleBlur() {
    setTouched(true);
    setError(validateEmail(email));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    setError(err);
    if (err) return;

    setIsLoading(true);
    setServerError("");
    try {
      await requestPasswordReset({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-[22px] font-semibold text-white mb-2">Check your email</h2>
        <p className="text-sm text-white/60 mb-6">
          If an account exists for{" "}
          <span className="text-white/80">{email}</span>, we've sent a password reset link.
        </p>
        <Link href="/user/login" className="text-[13px] text-white/80 font-medium hover:text-white transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-1">Forgot password?</h2>
      <p className="text-[13px] text-white/60 mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <AlertIcon size={14} />
          <p className="text-sm text-red-400 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email" error={touched ? error : undefined}>
          <FormInput
            id="email" name="email" type="email" autoComplete="email"
            placeholder="you@example.com" value={email}
            onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(touched && error)}
          />
        </FormField>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">{Spinner}Sending…</span>
          ) : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-[13px] text-white/50 mt-5">
        <Link href="/user/login" className="text-white/80 font-medium hover:text-white transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
