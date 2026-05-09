"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function ToastItem({ toast, onClose }) {
  const base =
    toast.type === "success"
      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#065F46]"
      : toast.type === "error"
        ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
        : "border-[#E5E7EB] bg-white text-[#111827]";

  return (
    <div
      className={`hc-animate-fade-up pointer-events-auto w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-dashed px-4 py-3 shadow-md ${base}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-sm font-medium">{toast.message}</div>
        <button
          type="button"
          aria-label="Close toast"
          onClick={() => onClose(toast.id)}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-current/70 transition hover:bg-red-500/10 hover:text-red-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timers = timersRef.current;
    const timer = timers.get(id);
    if (timer) window.clearTimeout(timer);
    timers.delete(id);
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      const timer = window.setTimeout(() => remove(id), 3500);
      timersRef.current.set(id, timer);

      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => undefined,
      error: () => undefined,
      info: () => undefined,
      remove: () => undefined,
    };
  }
  return ctx;
}
