"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput, getPasswordStrength } from "@/components/common/FormInput";
import { validateRegister } from "@/utils/validateRegister";

const INITIAL = {
  organization: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const RegisterPage = () => {
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
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateRegister(next)[name] }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateRegister(values)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.keys(INITIAL).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validateRegister(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setServerError("");
    try {
      await register({
        ...(values.organization.trim() && { organization: values.organization.trim() }),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-6">Create an account</h2>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <AlertIcon size={14} />
          <p className="text-sm text-red-400 leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <FormField label="Organization (optional)" error={fieldError("organization")}>
          <FormInput
            id="organization" name="organization" type="text"
            autoComplete="organization" placeholder="Your organization or company"
            value={values.organization} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("organization"))}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" error={fieldError("firstName")}>
            <FormInput id="firstName" name="firstName" type="text" autoComplete="given-name"
              placeholder="John" value={values.firstName} onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("firstName"))} />
          </FormField>
          <FormField label="Last name" error={fieldError("lastName")}>
            <FormInput id="lastName" name="lastName" type="text" autoComplete="family-name"
              placeholder="Doe" value={values.lastName} onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("lastName"))} />
          </FormField>
        </div>

        <FormField label="Email" error={fieldError("email")}>
          <FormInput id="email" name="email" type="email" autoComplete="email"
            placeholder="you@example.com" value={values.email} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("email"))} />
        </FormField>

        <FormField label="Password" error={fieldError("password")}>
          <div className="relative">
            <FormInput id="password" name="password"
              type={showPassword ? "text" : "password"} autoComplete="new-password"
              placeholder="Min. 8 characters" value={values.password}
              onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("password"))} className="pr-11"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? EyeOffIcon : EyeIcon}
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

        <FormField label="Confirm password" error={fieldError("confirmPassword")}>
          <div className="relative">
            <FormInput id="confirmPassword" name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
              placeholder="Re-enter your password" value={values.confirmPassword}
              onChange={handleChange} onBlur={handleBlur}
              hasError={Boolean(fieldError("confirmPassword"))} className="pr-11"
            />
            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
              {showConfirmPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
        </FormField>

        <button type="submit" disabled={isLoading}
          className="w-full rounded-lg py-3 text-[15px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">{Spinner}Creating account…</span>
          ) : "Create account"}
        </button>
      </form>

      <p className="text-center text-[13px] text-white/50 mt-5">
        Already have an account?{" "}
        <Link href="/user/login" className="text-white/80 font-medium hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
