"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const RouteProgressBar = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const prevPathname = useRef(pathname);

  // When pathname changes, navigation is complete — finish the bar
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      clearInterval(intervalRef.current);
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      prevPathname.current = pathname;
      return () => clearTimeout(hideTimer);
    }
  }, [pathname]);

  // Listen for link clicks to start the progress bar
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor || !anchor.href) return;

      try {
        const url = new URL(anchor.href);
        const isSameOrigin = url.origin === window.location.origin;
        const isDifferentPath = url.pathname !== window.location.pathname;
        const isNotHash = !anchor.href.startsWith("#");
        const isNotExternal = !anchor.target || anchor.target === "_self";

        if (isSameOrigin && isDifferentPath && isNotHash && isNotExternal) {
          clearInterval(intervalRef.current);
          setVisible(true);
          setProgress(15);

          let current = 15;
          intervalRef.current = setInterval(() => {
            // Slow down as it approaches 85%
            const increment = Math.random() * (current < 50 ? 12 : current < 70 ? 6 : 2);
            current = Math.min(current + increment, 85);
            setProgress(current);
          }, 250);
        }
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[2px] bg-red-600"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transition: visible
          ? "width 0.25s ease-out, opacity 0.1s ease"
          : "width 0.4s ease-out, opacity 0.3s ease 0.05s",
        boxShadow: visible ? "0 0 8px rgba(16, 185, 129, 0.7)" : "none",
      }}
    />
  );
}

export default RouteProgressBar;