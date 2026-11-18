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
  const inFlightRef = useRef(null);
  const queuedRef = useRef(false);
  const runSaveRef = useRef(null);
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
    // Only one save runs at a time. A second request asks the running save to pick up the
    // newest state when it finishes, instead of sending two overlapping snapshots.
    if (inFlightRef.current) {
      queuedRef.current = true;
      return inFlightRef.current;
    }

    if (typeof persistRef.current !== "function") {
      return { ok: false, error: "Nothing to save." };
    }

    const run = (async () => {
      guardRef.current?.markSaving?.();
      try {
        while (true) {
          queuedRef.current = false;
          const requestSnapshot = serialize(depsRef.current);

          if (requestSnapshot === baselineRef.current) {
            guardRef.current?.markClean?.();
            return { ok: true };
          }

          const result = await persistRef.current();
          if (result && result.ok === false) {
            throw new Error(result.error || "We couldn’t save your changes. Please try again.");
          }

          // Only the values that were actually sent count as saved. If the admin changed
          // something while the request was running, keep dirty and save the newer state.
          baselineRef.current = requestSnapshot;
          const currentSnapshot = serialize(depsRef.current);
          if (currentSnapshot === requestSnapshot && !queuedRef.current) {
            guardRef.current?.markClean?.();
            return { ok: true };
          }
        }
      } catch (err) {
        const message = err?.message || "We couldn’t save your changes. Please try again.";
        guardRef.current?.markError?.(message);
        return { ok: false, error: message };
      }
    })();

    inFlightRef.current = run;
    try {
      return await run;
    } finally {
      inFlightRef.current = null;
      if (queuedRef.current) {
        queuedRef.current = false;
        if (serialize(depsRef.current) !== baselineRef.current) {
          setTimeout(() => {
            void runSaveRef.current?.();
          }, 0);
        }
      }
    }
  }, []);
  runSaveRef.current = runSave;

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
