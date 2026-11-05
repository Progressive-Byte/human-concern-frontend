"use client";

import { createPortal } from "react-dom";

/*
  The heart that floats off the Recurring button.

  It is drawn on <body>, above everything, at the heart's screen position.
  The caller measures the heart when it is pressed; this only draws.
*/
export default function RisingHeart({ trigger, left, top, color }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <span
      key={trigger}
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] -translate-x-1/2"
      style={{ left, top }}
    >
      <svg
        viewBox="0 0 24 24"
        className="hc-heart-rise h-8 w-8 fill-current"
        style={{ color: color || "#EA3335" }}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </span>,
    document.body,
  );
}
