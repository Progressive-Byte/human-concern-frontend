"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders a row-action menu anchored to its trigger, inside the admin scroll area.
 *
 * Positioning is done in layout pixels, not viewport pixels. The admin root applies a CSS `zoom`
 * and the content lives in a scrolling panel, so a `position: fixed` menu computed from
 * `getBoundingClientRect()` drifts away from the row once the panel scrolls or the zoom is
 * applied. Rendering the menu as an absolute child of the scroll panel keeps it in the same
 * coordinate space as the row: it lines up with the button and moves with the content.
 *
 * Callers keep their own `open` state and outside-click listeners unchanged: a mousedown inside
 * the panel is stopped before it reaches the document-level listeners, so the menu is not closed
 * before the clicked item's handler runs.
 */

// The declicked scroll host is the admin content panel, marked with `data-admin-scroll`.
function findHost(el) {
  return el?.closest?.("[data-admin-scroll]") || (typeof document === "undefined" ? null : document.body);
}

// Distance from the host's content origin to the element, in layout pixels. `offsetTop/Left` do
// not include scroll, so the scroll of any inner scroller (for example the table's horizontal
// scroll) is removed to get the element's real place in the panel.
function offsetWithin(el, host) {
  // Sum offsets up the `offsetParent` chain; unlike `parentElement`, this stays correct when a
  // transformed card sits between the row and the scroll panel.
  let top = 0;
  let left = 0;
  let node = el;
  while (node && node !== host) {
    top += node.offsetTop;
    left += node.offsetLeft;
    node = node.offsetParent;
  }

  // `offsetTop/Left` ignore scroll, so remove the scroll of any inner scroller between the row
  // and the panel (for example the table's horizontal scroll).
  let parent = el.parentElement;
  while (parent && parent !== host) {
    if (parent.scrollLeft) left -= parent.scrollLeft;
    if (parent.scrollTop) top -= parent.scrollTop;
    parent = parent.parentElement;
  }

  return { top, left, width: el.offsetWidth, height: el.offsetHeight };
}

export default function RowActionsPanel({ open, anchorRef, className = "", children }) {
  const [panelEl, setPanelEl] = useState(null);
  const [host, setHost] = useState(null);
  // null until measured: the first frame stays hidden rather than flashing at a guessed spot.
  const [pos, setPos] = useState(null);
  const hostRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setHost(null);
      setPos(null);
      return;
    }
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const nextHost = findHost(anchor);
    hostRef.current = nextHost;
    setHost(nextHost);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open || !panelEl || !hostRef.current) return;
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const hostEl = hostRef.current;
    const isBody = hostEl === document.body;

    function recalc() {
      const rect = offsetWithin(anchor, hostEl);
      const gap = 8;
      const panelWidth = panelEl.offsetWidth;
      const panelHeight = panelEl.offsetHeight;
      const scrollTop = isBody ? 0 : hostEl.scrollTop;
      const scrollLeft = isBody ? 0 : hostEl.scrollLeft;
      const viewportHeight = isBody ? window.innerHeight : hostEl.clientHeight;

      // `rect.top` is the row's position inside the panel content (scroll is not counted twice).
      const spaceBelow = viewportHeight - (rect.top - scrollTop + rect.height);
      const top = panelHeight && spaceBelow < panelHeight + gap + 8
        ? Math.max(scrollTop + 8, rect.top - panelHeight - gap)
        : rect.top + rect.height + gap;
      const left = Math.max(scrollLeft + 8, rect.left + rect.width - panelWidth);

      setPos({ top, left });
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
  }, [open, panelEl, anchorRef, host]);

  if (!open || !host) return null;

  return createPortal(
    <div
      ref={setPanelEl}
      role="menu"
      onMouseDown={(event) => event.stopPropagation()}
      className={`hc-animate-dropdown absolute z-[210] ${className}`}
      style={{
        top: pos ? pos.top : 0,
        left: pos ? pos.left : 8,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    host,
  );
}
