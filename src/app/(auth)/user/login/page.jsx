"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, GoogleIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput, validateLogin } from "@/components/common/FormInput";

export default function LoginPage() {
  const { login } = useAuth();

  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateLogin(next)[name] }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateLogin(values)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validateLogin(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");
    try {
      await login({ email: values.email, password: values.password });
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-6">Nice to see you again</h2>

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
            placeholder="you@example.com" value={values.email}
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={rememberMe}
              onClick={() => setRememberMe((v) => !v)}
              className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none ${rememberMe ? "bg-[#EA3335]" : "bg-white/20"}`}
            >
              <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${rememberMe ? "translate-x-[18px]" : "translate-x-0"}`} />
            </button>
            <span className="text-[13px] text-white/70">Remember me</span>
          </label>

          <Link href="/user/forgot-password" className="text-[13px] text-white/60 hover:text-white transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">{Spinner}Signing in…</span>
          ) : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-[14px] font-medium text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {GoogleIcon}
        Or sign in with Google
      </button>

      <p className="text-center text-[13px] text-white/50 mt-5">
        Don't have an account?{" "}
        <Link href="/user/register" className="text-white/80 font-medium hover:text-white transition-colors">
          Sign up now
        </Link>
      </p>
    </div>
  );
}
