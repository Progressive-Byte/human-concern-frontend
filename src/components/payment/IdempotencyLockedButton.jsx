"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { getUserFacingErrorMessage } from "@/utils/errorMaps";

const DEFAULT_LABEL = "Submit";
const DEFAULT_LOADING_LABEL = "Processing…";

function is4xxValidationError(err) {
  const status = Number(err?.statusCode ?? err?.status ?? 0);
  if (status >= 400 && status < 500) {
    if (status === 401 || status === 403 || status === 404) return false;
    return true;
  }
  const code = String(err?.code ?? "").toUpperCase();
  if (
    code.includes("VALIDATION") ||
    code.includes("INVALID_") ||
    code.includes("MISSING_") ||
    code === "BAD_REQUEST"
  ) {
    return true;
  }
  return false;
}

const SpinnerIcon = ({ className = "h-4 w-4" }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const IdempotencyLockedButton = forwardRef(function IdempotencyLockedButton(
  {
    children,
    onClick,
    disabled = false,
    loadingLabel,
    className = "",
    type = "button",
    variant = "primary",
    spinnerPosition = "left",
    ...rest
  },
  ref
) {
  const [isLocked, setIsLocked] = useState(false);
  const [lastError, setLastError] = useState(null);

  useImperativeHandle(ref, () => ({
    unlock: () => setIsLocked(false),
    reportError: (err) => {
      setLastError(err ?? null);
      if (is4xxValidationError(err)) {
        setIsLocked(false);
      }
    },
    reportSuccess: () => {
      setLastError(null);
    },
    reset: () => {
      setIsLocked(false);
      setLastError(null);
    },
    get isLocked() {
      return isLocked;
    },
  }));

  const label = children ?? DEFAULT_LABEL;
  const activeLoadingLabel = loadingLabel ?? DEFAULT_LOADING_LABEL;

  const handleClick = async (e) => {
    if (disabled || isLocked) return;
    setIsLocked(true);
    setLastError(null);
    try {
      if (typeof onClick === "function") {
        const result = onClick(e);
        if (result && typeof result.then === "function") {
          await result;
        }
      }
    } catch (err) {
      setLastError(err ?? null);
      if (is4xxValidationError(err)) {
        setIsLocked(false);
      }
      throw err;
    }
  };

  const errorMessage = lastError ? getUserFacingErrorMessage(lastError?.code, null) : null;

  const baseCls =
    variant === "primary"
      ? "flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[15px] font-semibold transition-all cursor-pointer w-full"
      : "flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#E5E5E5] hover:border-[#383838] active:scale-95 text-[#1A1A1A] text-[15px] font-semibold transition-all cursor-pointer w-full";

  const content = isLocked ? (
    spinnerPosition === "right" ? (
      <>
        <span>{activeLoadingLabel}</span>
        <SpinnerIcon className="h-4 w-4" />
      </>
    ) : (
      <>
        <SpinnerIcon className="h-4 w-4" />
        <span>{activeLoadingLabel}</span>
      </>
    )
  ) : (
    label
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type={type}
        onClick={handleClick}
        disabled={disabled || isLocked}
        className={`${baseCls} ${
          disabled || isLocked ? "opacity-60 cursor-not-allowed active:scale-100" : ""
        } ${className}`.trim()}
        {...rest}
      >
        {content}
      </button>
      {errorMessage && isLocked === false && (
        <p className="text-[12px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-3 py-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default IdempotencyLockedButton;
