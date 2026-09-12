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
  delayMs = 1000,
  enabled = true,
}) {
  const guard = useFormEditorGuard();

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

    guard?.markSaving?.();
    try {
      const result = await persistRef.current();
      if (result && result.ok === false) {
        throw new Error(result.error || "Could not save your changes.");
      }
      baselineRef.current = next;
      guard?.markClean?.();
      return { ok: true };
    } catch (err) {
      guard?.markError?.();
      return { ok: false, error: err?.message || "Could not save your changes." };
    }
  }, [guard]);

  // Let the unsaved-changes dialog force an immediate save.
  useEffect(() => {
    if (!active) return undefined;
    guard.registerFlush(runSave);
    return () => guard.clearFlush();
  }, [active, guard, runSave]);

  // Debounced save whenever the step's values change.
  useEffect(() => {
    if (!active || !ready) return undefined;
    if (snapshot === baselineRef.current) return undefined;

    guard.markDirty();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSave();
    }, delayMs);

    return () => clearTimeout(timerRef.current);
  }, [active, ready, snapshot, delayMs, guard, runSave]);

  return { saveNow: runSave };
}
