"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormEditorGuard } from "../components/FormEditorGuardProvider";

function serialize(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return null;
  }
}

/**
 * Debounced autosave for a wizard step.
 *
 * `deps` is the list of state values the step would persist — it only has to identify a
 * change, not be the payload itself. `persist` performs the actual save and should resolve
 * `{ ok: true }` (or throw). Validation deliberately lives inside the step's own save, so a
 * half-filled step simply fails to persist and stays dirty (covered by the warning dialog).
 */
export default function useStepAutosave({
  formId = "",
  deps = [],
  ready = true,
  persist,
  intervalMs = 30000,
  enabled = true,
}) {
  const guard = useFormEditorGuard();
  // Hold the latest guard in a ref so the effects below don't re-run every time the provider
  // rebuilds its context value (which happens on each dirty/save-state change).
  const guardRef = useRef(guard);
  guardRef.current = guard;

  const baselineRef = useRef(null);
  const timerRef = useRef(null);
  const persistRef = useRef(persist);
  const depsRef = useRef(deps);
  persistRef.current = persist;
  depsRef.current = deps;

  const snapshot = serialize(deps);
  const active = Boolean(enabled && formId && guard);

  // The baseline is whatever the step loaded; anything after that is "dirty".
  useEffect(() => {
    if (!ready) return;
    baselineRef.current = snapshot;
    // Only re-baseline when the step (re)loads, never on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, formId]);

  const runSave = useCallback(async () => {
    const next = serialize(depsRef.current);
    if (next === baselineRef.current) return { ok: true };
    if (typeof persistRef.current !== "function") return { ok: false, error: "Nothing to save." };

    guardRef.current?.markSaving?.();
    try {
      const result = await persistRef.current();
      if (result && result.ok === false) {
        throw new Error(result.error || "Could not save your changes.");
      }
      // Most steps re-read the form after saving and set state from the server's copy, which
      // changes `deps`. Let that render land, then re-baseline from the *current* values —
      // otherwise the hook reads the refresh as a fresh edit and saves on a loop.
      await new Promise((resolve) => setTimeout(resolve, 0));
      baselineRef.current = serialize(depsRef.current);
      guardRef.current?.markClean?.();
      return { ok: true };
    } catch (err) {
      const message = err?.message || "Could not save your changes.";
      guardRef.current?.markError?.(message);
      return { ok: false, error: message };
    }
  }, []);

  // Let the unsaved-changes dialog force an immediate save.
  useEffect(() => {
    if (!active) return undefined;
    guardRef.current?.registerFlush?.(runSave);
    return () => guardRef.current?.clearFlush?.();
  }, [active, runSave]);

  // Mark dirty as soon as the step's values drift from the baseline.
  useEffect(() => {
    if (!active || !ready) return undefined;
    if (snapshot === baselineRef.current) return undefined;
    guardRef.current?.markDirty?.();
  }, [active, ready, snapshot]);

  /**
   * Save on intent, not on a short idle timer — leaving a field, or a slow safety net. Pausing
   * to think therefore fires nothing, and because `silent` keeps `saving` (and the inputs'
   * `disabled`) untouched, a save never interrupts typing.
   */
  useEffect(() => {
    if (!active || !ready) return undefined;

    function saveIfDirty() {
      if (serialize(depsRef.current) === baselineRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (serialize(depsRef.current) === baselineRef.current) return;
        void runSave();
      }, 250);
    }

    document.addEventListener("focusout", saveIfDirty);
    const intervalId = setInterval(saveIfDirty, intervalMs);

    return () => {
      document.removeEventListener("focusout", saveIfDirty);
      clearInterval(intervalId);
      clearTimeout(timerRef.current);
    };
  }, [active, ready, intervalMs, runSave]);

  return { saveNow: runSave };
}
