"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  Mobile bottom sheet for the donation summary.

  The pill at the top is a grab handle, so it has to actually drag — a handle that does nothing
  tells the donor a gesture exists and then ignores it. Dragging down past the threshold, or a
  quick flick, closes the sheet; anything shorter springs back.

  Both the wizard and the step-3 pay screen render this, which is why it lives here instead of
  being copy-pasted into each.
*/

const CLOSE_DISTANCE = 110;
const FLICK_DISTANCE = 36;
const FLICK_MS = 260;

const SummarySheet = ({ open, onClose, title = "Donation summary", hiddenClassName = "", children }) => {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);
  const startTime = useRef(0);

  const reset = useCallback(() => {
    startY.current = null;
    setDragY(0);
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePointerDown = (event) => {
    startY.current = event.clientY;
    startTime.current = Date.now();
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (startY.current == null) return;
    setDragY(Math.max(0, event.clientY - startY.current));
  };

  const handlePointerUp = (event) => {
    if (startY.current == null) return;
    const distance = Math.max(0, event.clientY - startY.current);
    const flicked = Date.now() - startTime.current < FLICK_MS && distance > FLICK_DISTANCE;
    startY.current = null;
    setDragging(false);
    if (distance > CLOSE_DISTANCE || flicked) {
      setDragY(0);
      onClose?.();
      return;
    }
    setDragY(0);
  };

  if (!open) return null;

  // The backdrop fades as the sheet is pulled down, so the drag has visible feedback.
  const progress = Math.min(1, dragY / CLOSE_DISTANCE);

  return (
    <div className={`fixed inset-0 z-50 ${hiddenClassName}`}>
      <button
        type="button"
        aria-label="Close donation summary"
        onClick={() => onClose?.()}
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px]"
        style={{ opacity: 1 - progress * 0.6 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-3xl border-t border-[#E5E5E5] bg-white pt-2 shadow-2xl"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Grab area: the pill only, kept small so the list above it still scrolls normally. */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex cursor-grab touch-none justify-center pb-2 active:cursor-grabbing"
        >
          <div className="h-1 w-10 rounded-full bg-[#D6D6D6]" />
        </div>

        <div className="flex items-center justify-between px-4 pb-1">
          <p className="text-[13px] font-semibold text-[#383838]">{title}</p>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-semibold text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#383838]"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default SummarySheet;
