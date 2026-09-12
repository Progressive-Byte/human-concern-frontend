"use client";

import { useState } from "react";

const TrackDonationPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const value = String(email || "").trim();
    if (!value) {
      setError("Please enter the email address you used when donating.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  return (
    <main className="min-h-[60vh] px-4 sm:px-6 lg:px-20 py-14 sm:py-20">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-[28px] sm:text-[36px] font-bold text-[#111111] m-0">Track Your Donation</h1>
        <p className="mt-3 text-[15px] sm:text-[17px] text-[#383838] leading-relaxed">
          Enter the email address you used when you donated and we&apos;ll show you the status of your gift.
        </p>

        <form
          onSubmit={handleSubmit}
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
            className="w-full rounded-full border border-[#DDDDDD] px-5 py-3.5 text-[15px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none transition-colors duration-200 focus:border-[#CC1F1F]"
          />
          {error ? <p className="mt-2 text-[13px] text-[#CC1F1F]">{error}</p> : null}

          <button
            type="submit"
            className="mt-5 w-full cursor-pointer rounded-full bg-[#CC1F1F] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#A81A1A]"
          >
            Track Donation
          </button>

          {submitted ? (
            <div className="mt-5 rounded-2xl border border-[#F5D9D9] bg-[#FFF6F6] px-5 py-4">
              <p className="m-0 text-[15px] font-semibold text-[#111111]">Thanks — we&apos;ve got your email.</p>
              <p className="m-0 mt-1 text-[14px] leading-relaxed text-[#383838]">
                Donation tracking is still being built and isn&apos;t live yet. In the meantime, email us at{" "}
                <a href="mailto:info@humanconcernusa.org" className="font-semibold text-[#CC1F1F] underline">
                  info@humanconcernusa.org
                </a>{" "}
                or call 1-800-583-5841 and we&apos;ll gladly help with a receipt or the status of your gift.
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
};

export default TrackDonationPage;
