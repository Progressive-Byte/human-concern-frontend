"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const REDIRECT_AFTER_LOGIN = "/dashboard/schedules";

/**
 * Shown when a visitor without an account taps an action that needs one
 * (managing/editing recurring donations).
 */
const AccountRequiredModal = ({ open, onClose, hasAccount = false, title, description }) => {
  const router = useRouter();

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const goTo = (path) => {
    try {
      sessionStorage.setItem("hc_redirect_after_login", REDIRECT_AFTER_LOGIN);
    } catch {
      // ignore storage failures
    }
    onClose?.();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-required-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#CC1F1F]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zM8 11V7a4 4 0 0 1 8 0v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 id="account-required-title" className="m-0 text-[18px] font-bold text-[#111111]">
              {title || "Log in or create an account to continue"}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#555555]">
              {description ||
                "Managing recurring donations — changing the amount, pausing or cancelling — is tied to your account."}
            </p>
            {hasAccount ? (
              <p className="mt-2 text-[13px] text-[#777777]">
                We already have an account for this email. Log in to manage your donations.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => goTo("/user/login")}
            className="flex-1 cursor-pointer rounded-full bg-[#CC1F1F] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#A81A1A]"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => goTo("/user/register")}
            className="flex-1 cursor-pointer rounded-full border border-[#DDDDDD] bg-white px-5 py-3 text-[14px] font-semibold text-[#111111] transition-colors hover:border-[#CC1F1F] hover:text-[#CC1F1F]"
          >
            Create account
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full cursor-pointer rounded-full px-5 py-2 text-[13px] font-medium text-[#777777] transition-colors hover:text-[#111111]"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default AccountRequiredModal;
