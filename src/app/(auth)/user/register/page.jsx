"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/context/AuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, Spinner } from "@/components/common/SvgIcon";
import { FormField, FormInput, getPasswordStrength } from "@/components/common/FormInput";
import CustomDropdown from "@/components/common/CustomDropdown";
import { validateRegister } from "@/utils/validateRegister";

const INITIAL = {
  organization: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  streetName: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  password: "",
  confirmPassword: "",
  terms: false,
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
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode]     = useState("");

  const strength = getPasswordStrength(values.password);

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => countryCode ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name })) : [],
    [countryCode]
  );
  const cityOptions = useMemo(
    () => countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name })) : [],
    [countryCode, stateCode]
  );

  function handleCountryChange(isoCode) {
    const country = Country.getCountryByCode(isoCode);
    setCountryCode(isoCode);
    setStateCode("");
    const next = { ...values, country: country?.name ?? "", state: "", city: "" };
    setValues(next);
    setTouched((prev) => ({ ...prev, country: true }));
    setErrors((prev) => ({ ...prev, country: validateRegister(next).country, state: undefined, city: undefined }));
  }

  function handleStateChange(isoCode) {
    const state = State.getStateByCodeAndCountry(isoCode, countryCode);
    setStateCode(isoCode);
    const next = { ...values, state: state?.name ?? "", city: "" };
    setValues(next);
    setTouched((prev) => ({ ...prev, state: true }));
    setErrors((prev) => ({ ...prev, state: validateRegister(next).state, city: undefined }));
  }

  function handleCityChange(cityName) {
    const next = { ...values, city: cityName };
    setValues(next);
    setTouched((prev) => ({ ...prev, city: true }));
    setErrors((prev) => ({ ...prev, city: validateRegister(next).city }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
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
        organization: values.organization.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        ...(values.phone.trim() && { phone: values.phone.trim() }),
        addressLine1: values.addressLine1.trim(),
        streetName: values.streetName.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        postalCode: values.postalCode.trim(),
        country: values.country.trim(),
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

        <FormField label="Organization" error={fieldError("organization")}>
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

        <FormField label="Phone (optional)" error={fieldError("phone")}>
          <FormInput id="phone" name="phone" type="tel" autoComplete="tel"
            placeholder="+1 234 567 8900" value={values.phone} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("phone"))} />
        </FormField>

        <FormField label="Address line 1" error={fieldError("addressLine1")}>
          <FormInput id="addressLine1" name="addressLine1" type="text" autoComplete="address-line1"
            placeholder="22 Baker Street" value={values.addressLine1} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("addressLine1"))} />
        </FormField>

        <FormField label="Street name" error={fieldError("streetName")}>
          <FormInput id="streetName" name="streetName" type="text"
            placeholder="Baker Street" value={values.streetName} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("streetName"))} />
        </FormField>

        <FormField label="Country" error={fieldError("country")}>
          <CustomDropdown
            variant="form"
            options={countryOptions}
            value={countryCode}
            onChange={handleCountryChange}
            placeholder="Select country"
            label="Countries"
            maxHeight="220px"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="State / Province" error={fieldError("state")}>
            <CustomDropdown
              variant="form"
              options={stateOptions}
              value={stateCode}
              onChange={handleStateChange}
              placeholder={countryCode ? "Select state" : "Select country first"}
              label="States"
              maxHeight="220px"
              disabled={!countryCode}
            />
          </FormField>
          <FormField label="City" error={fieldError("city")}>
            <CustomDropdown
              variant="form"
              options={cityOptions}
              value={values.city}
              onChange={handleCityChange}
              placeholder={stateCode ? "Select city" : "Select state first"}
              label="Cities"
              maxHeight="220px"
              disabled={!stateCode}
            />
          </FormField>
        </div>

        <FormField label="Postal code" error={fieldError("postalCode")}>
          <FormInput id="postalCode" name="postalCode" type="text" autoComplete="postal-code"
            placeholder="12345" value={values.postalCode} onChange={handleChange} onBlur={handleBlur}
            hasError={Boolean(fieldError("postalCode"))} />
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
}
export default RegisterPage;