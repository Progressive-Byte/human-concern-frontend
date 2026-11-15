"use client";

import { useEffect } from "react";

/**
 * Adds a second horizontal scrollbar above every wide admin table.
 *
 * The real scrollbar sits under the last row, so a long table only shows it when the admin
 * reaches the bottom. This mirrors it at the top and keeps both in sync.
 *
 * Tables mount after their data loads, so the scan runs again on DOM changes and on resize.
 */
export default function TableOverflowWatcher() {
  useEffect(() => {
    let frame = 0;
    const wired = new WeakSet();

    /* One top bar per table box, reused when the table re-renders. */
    const ensureBar = (el) => {
      let bar = el.previousElementSibling;

      if (!bar || !bar.classList.contains("hc-table-scroll-top")) {
        bar = document.createElement("div");
        bar.className = "hc-table-scroll-top";
        bar.setAttribute("aria-hidden", "true");

        const fill = document.createElement("div");
        fill.className = "hc-table-scroll-top-fill";
        bar.appendChild(fill);

        /* The top bar is the driver; the table follows it. */
        bar.addEventListener("scroll", () => {
          if (el.scrollLeft !== bar.scrollLeft) el.scrollLeft = bar.scrollLeft;
        });

        el.parentNode?.insertBefore(bar, el);
      }

      /* The table can also be scrolled by touch or the bottom bar; the top bar follows. */
      if (!wired.has(el)) {
        wired.add(el);
        el.addEventListener("scroll", () => {
          const top = el.previousElementSibling;
          if (
            top &&
            top.classList.contains("hc-table-scroll-top") &&
            top.scrollLeft !== el.scrollLeft
          ) {
            top.scrollLeft = el.scrollLeft;
          }
        });
      }

      return bar;
    };

    const check = () => {
      frame = 0;

      /* Drop bars whose table has gone. */
      document.querySelectorAll(".hc-table-scroll-top").forEach((bar) => {
        if (!bar.nextElementSibling?.classList.contains("hc-table-scroll")) bar.remove();
      });

      document.querySelectorAll(".hc-table-scroll").forEach((el) => {
        const overflows = el.scrollWidth - el.clientWidth > 2;
        const bar = ensureBar(el);
        bar.style.display = overflows ? "block" : "none";
        if (!overflows) return;

        const fill = bar.firstElementChild;
        const width = `${el.scrollWidth}px`;
        if (fill && fill.style.width !== width) fill.style.width = width;
        if (Math.abs(bar.scrollLeft - el.scrollLeft) > 1) bar.scrollLeft = el.scrollLeft;
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
