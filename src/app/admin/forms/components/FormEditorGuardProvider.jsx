"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

const FormEditorGuardContext = createContext(null);

/**
 * Shared dirty-state + navigation guard for the form wizard. Steps remount on every step
 * change (navigation is URL-driven), so this state has to live above them.
 * Returns null outside the provider so steps can be rendered standalone.
 */
export function useFormEditorGuard() {
  return useContext(FormEditorGuardContext);
}

const FormEditorGuardProvider = ({ children }) => {
  const router = useRouter();

  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | dirty | saving | saved | error
  const [dialog, setDialog] = useState({ open: false, go: null, saving: false, error: "" });

  const dirtyRef = useRef(false);
  const flushRef = useRef(null);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setIsDirty(true);
    setSaveState((prev) => (prev === "saving" ? prev : "dirty"));
  }, []);

  const markClean = useCallback(() => {
    dirtyRef.current = false;
    setIsDirty(false);
    setSaveState("saved");
  }, []);

  const markSaving = useCallback(() => setSaveState("saving"), []);
  const markError = useCallback(() => setSaveState("error"), []);

  const registerFlush = useCallback((fn) => {
    flushRef.current = fn;
  }, []);

  const clearFlush = useCallback(() => {
    flushRef.current = null;
  }, []);

  /**
   * Run `go` immediately when clean; otherwise hold it until the admin chooses.
   */
  const confirmNavigation = useCallback((go) => {
    if (typeof go !== "function") return;
    if (!dirtyRef.current) {
      go();
      return;
    }
    setDialog({ open: true, go, saving: false, error: "" });
  }, []);

  // Tab close / refresh — the browser only allows its own generic prompt.
  useEffect(() => {
    function onBeforeUnload(event) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // In-app link navigation (sidebar, breadcrumbs, …). The App Router has no route blocker,
  // so intercept plain left-clicks on same-origin anchors while dirty and let the dialog
  // decide; everything else is left untouched.
  useEffect(() => {
    function onClickCapture(event) {
      if (!dirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      confirmNavigation(() => router.push(`${url.pathname}${url.search}${url.hash}`));
    }

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [confirmNavigation, router]);

  function closeDialog() {
    setDialog({ open: false, go: null, saving: false, error: "" });
  }

  async function handleSave() {
    const go = dialog.go;
    setDialog((prev) => ({ ...prev, saving: true, error: "" }));

    try {
      const flush = flushRef.current;
      if (flush) {
        const result = await flush();
        if (!result || result.ok !== true) {
          throw new Error((result && result.error) || "Could not save your changes.");
        }
      }
      dirtyRef.current = false;
      setIsDirty(false);
      setDialog({ open: false, go: null, saving: false, error: "" });
      if (go) go();
    } catch (err) {
      setDialog((prev) => ({ ...prev, saving: false, error: err?.message || "Could not save your changes." }));
    }
  }

  function handleDiscard() {
    const go = dialog.go;
    dirtyRef.current = false;
    setIsDirty(false);
    setDialog({ open: false, go: null, saving: false, error: "" });
    if (go) go();
  }

  const value = useMemo(
    () => ({
      isDirty,
      saveState,
      markDirty,
      markClean,
      markSaving,
      markError,
      registerFlush,
      clearFlush,
      confirmNavigation,
    }),
    [isDirty, saveState, markDirty, markClean, markSaving, markError, registerFlush, clearFlush, confirmNavigation]
  );

  return (
    <FormEditorGuardContext.Provider value={value}>
      {children}
      <UnsavedChangesDialog
        open={dialog.open}
        saving={dialog.saving}
        error={dialog.error}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={closeDialog}
      />
    </FormEditorGuardContext.Provider>
  );
};

export default FormEditorGuardProvider;
