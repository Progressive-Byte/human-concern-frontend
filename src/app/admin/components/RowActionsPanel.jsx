"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders a row-action menu into a portal on `document.body`, anchored to its trigger.
 *
 * Why a higher z-index is not enough: every admin table wraps its rows in
 * `<div className="overflow-x-auto">`, and `overflow` clipping ignores z-index. Switching the
 * panel to `position: fixed` does not help either — each table card carries `hc-hover-lift`
 * (`will-change: transform`, see globals.css), which makes the card the containing block for
 * `fixed` descendants, so the panel is still trapped inside the card. The panel therefore has
 * to be rendered outside the table, positioned from the trigger's rect so it still opens in
 * the same place it always did.
 *
 * Callers keep their own `open` state and outside-click listeners unchanged: a mousedown inside
 * the panel is stopped before it reaches the document-level listeners (React runs its handlers
 * on the root container, ahead of `document` listeners), so the menu is not closed before the
 * clicked item's handler runs.
 */
export default function RowActionsPanel({ open, anchorRef, className = "", children }) {
  const [panelEl, setPanelEl] = useState(null);
  // null until measured: the first frame stays hidden rather than flashing at a guessed spot.
  const [pos, setPos] = useState(null);

  // Safe during render: the panel only renders when `open`, and `open` is always false on the
  // first client render, so this cannot cause a hydration mismatch.
  const portalNode = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) return;

    function recalc() {
      const rect = anchorRef?.current?.getBoundingClientRect?.();
      if (!rect) return;
      const gap = 8;
      const right = Math.max(8, window.innerWidth - rect.right);
      const panelHeight = panelEl?.offsetHeight || 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      // Open below the trigger, and flip above it only when it would overflow the viewport.
      const top = panelHeight && spaceBelow < panelHeight + gap + 8
        ? Math.max(8, rect.top - panelHeight - gap)
        : rect.bottom + gap;
      setPos({ top, right });
    }

    recalc();
    const raf = requestAnimationFrame(recalc); // second pass, once the panel has measured
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open, anchorRef, panelEl]);

  if (!open || !portalNode) return null;

  return createPortal(
    <div
      ref={setPanelEl}
      role="menu"
      onMouseDown={(event) => event.stopPropagation()}
      className={`hc-animate-dropdown fixed z-[210] ${className}`}
      style={{
        top: pos ? pos.top : 0,
        right: pos ? pos.right : 8,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    portalNode,
  );
}
