"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestDonationTrackLink } from "@/services/trackDonationService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

const TrackEmailForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [registeredMessage, setRegisteredMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send(value) {
    setError("");
    setSubmitting(true);
    try {
      const res = await requestDonationTrackLink({ email: value });
      if (res?.data?.registered) {
        setRegisteredMessage(res.data.message || "This email address is already registered. Log in to see your donations.");
        setSentTo("");
        return;
      }
      setRegisteredMessage("");
      setSentTo(value);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setError(e?.message || "We couldn't send the link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function submit(event) {
    event.preventDefault();

    const value = email.trim();
    if (!value) {
      setError("Please enter the email address you used when donating.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    send(value);
  }

  function resend() {
    const value = (sentTo || email).trim();
    if (!value) return;
    send(value);
  }

  function useAnotherEmail() {
    setSentTo("");
    setRegisteredMessage("");
    setError("");
    setCooldown(0);
  }

  function goToLogin() {
    try {
      sessionStorage.setItem("hc_redirect_after_login", "/dashboard/donation-history");
    } catch {
      // ignore storage failures
    }
    router.push("/user/login");
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
    >
      <label htmlFor="track-email" className="mb-2 block text-[14px] font-semibold text-[#383838]">
        Email address
      </label>
      <input
        id="track-email"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError("");
        }}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={submitting}
        className="w-full rounded-full border border-[#DDDDDD] px-5 py-3.5 text-[15px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none transition-colors duration-200 focus:border-[#CC1F1F] disabled:bg-[#F7F7F7]"
      />
      {error ? <p className="mt-2 text-[13px] text-[#CC1F1F]">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full cursor-pointer rounded-full bg-[#CC1F1F] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#A81A1A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending link…" : "Email me an access link"}
      </button>

      {registeredMessage ? (
        <div className="mt-5 rounded-2xl border border-[#D9E2F5] bg-[#F5F8FF] px-5 py-4">
          <p className="m-0 text-[14px] leading-relaxed text-[#383838]">{registeredMessage}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goToLogin}
              className="cursor-pointer rounded-full bg-[#CC1F1F] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#A81A1A]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={useAnotherEmail}
              className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-[#777777] transition-colors hover:text-[#111111]"
            >
              Use a different email
            </button>
          </div>
        </div>
      ) : null}

      {sentTo ? (
        <div className="mt-5 rounded-2xl border border-[#D7EAD9] bg-[#F3FAF4] px-5 py-4">
          <p className="m-0 text-[14px] leading-relaxed text-[#383838]">
            If we found donations for <span className="font-semibold">{sentTo}</span>, we&apos;ve sent an
            access link. The link expires in 30 minutes — check your spam folder if you don&apos;t see it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0 || submitting}
              className="cursor-pointer rounded-full border border-[#CC1F1F]/30 px-4 py-2 text-[13px] font-semibold text-[#CC1F1F] transition-colors hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
            </button>
            <button
              type="button"
              onClick={useAnotherEmail}
              className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-[#777777] transition-colors hover:text-[#111111]"
            >
              Use a different email
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default TrackEmailForm;
