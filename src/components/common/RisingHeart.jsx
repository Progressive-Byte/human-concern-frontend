"use client";

import { createPortal } from "react-dom";

/*
  The heart that floats off the Recurring button.

  It is drawn on <body>, above everything, at the heart's screen position.
  The caller passes the small heart's centre; this only draws.
*/
const HEART_SIZE = 32;

/* The site scales <html> with CSS zoom. Fixed coordinates are scaled again by
   that zoom, so screen measurements have to be divided back out. */
function getPageZoom() {
  const zoom = Number.parseFloat(window.getComputedStyle(document.documentElement).zoom);
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

export default function RisingHeart({ trigger, left, top, color }) {
  if (typeof document === "undefined") return null;

  const zoom = getPageZoom();

  return createPortal(
    <span
      key={trigger}
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] -translate-x-1/2"
      style={{ left: left / zoom, top: top / zoom - HEART_SIZE / 2 }}
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
