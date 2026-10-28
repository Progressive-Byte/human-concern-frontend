"use client";

import { useEffect } from "react";

/**
 * Marks every admin table that is wider than its box with `hc-overflow`.
 *
 * The horizontal scrollbar sits under the last row, so a long table only shows it when the
 * admin reaches the bottom. CSS turns this class into a small hint line above the table, which
 * is visible without scrolling down.
 *
 * Tables mount after their data loads, so the scan runs again on DOM changes and on resize.
 */
export default function TableOverflowWatcher() {
  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      document.querySelectorAll(".hc-table-scroll").forEach((el) => {
        const overflows = el.scrollWidth - el.clientWidth > 2;
        el.classList.toggle("hc-overflow", overflows);
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(check);
    };

    check();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return null;
}
