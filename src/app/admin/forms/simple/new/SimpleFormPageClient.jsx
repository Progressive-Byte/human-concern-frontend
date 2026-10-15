"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createAdminSimpleForm,
  discardAdminSimpleForm,
  getAdminFormSimple,
  publishAdminForm,
  updateAdminFormSimple,
} from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import FormEditorGuardProvider from "@/app/admin/forms/components/FormEditorGuardProvider";
import StatusPill from "@/app/admin/forms/components/StatusPill";
import SimpleFormEditor from "../components/SimpleFormEditor";

const EMPTY_CONTENT = { displayName: "", feePercent: null, presets: [], monthlyPresets: [], causeIds: [], allowRecurringDonations: false };

// The simple endpoints answer with { form, content, hasDraft, publishedAt }, where `content` is
// already the saved draft when there is one, otherwise the published values.
function readPayload(res) {
  const body = res?.data?.data || res?.data || res || {};
  const form = body?.form && typeof body.form === "object" ? body.form : {};
  const content = body?.content && typeof body.content === "object" ? body.content : EMPTY_CONTENT;

  return {
    formId: String(form?.id || form?._id || ""),
    status: String(form?.status || ""),
    content,
    hasDraft: Boolean(body?.hasDraft),
    publishedAt: body?.publishedAt || null,
  };
}

function SimpleFormHost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const campaignId = searchParams.get("campaignId") || "";
  const initialFormId = searchParams.get("formId") || "";

  const [formId, setFormId] = useState(initialFormId);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialFormId));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  const applyState = useCallback((parsed) => {
    if (parsed.formId) setFormId(parsed.formId);
    if (parsed.status) setStatus(parsed.status);
    setContent(parsed.content);
    setHasDraft(parsed.hasDraft);
    setPublishedAt(parsed.publishedAt);
  }, []);

  useEffect(() => {
    if (!initialFormId) {
      setContent(EMPTY_CONTENT);
      setLoading(false);
      return undefined;
    }

    let alive = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await getAdminFormSimple(initialFormId);
        if (!alive) return;
        applyState(readPayload(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load this form.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [applyState, initialFormId]);

  // Save draft. Creates the row the first time, then only ever replaces the working copy.
  const saveDraft = useCallback(
    async (payload) => {
      if (!formId && !campaignId) {
        const text = "Missing campaignId";
        setError(text);
        return { ok: false, error: text };
      }

      setBusy(true);
      setError("");
      setMessage(null);

      try {
        const res = formId
          ? await updateAdminFormSimple(formId, payload)
          : await createAdminSimpleForm(campaignId, payload);

        const parsed = readPayload(res);
        applyState(parsed);
        setMessage({ tone: "ok", text: "Draft saved. The live version is unchanged." });
        return { ok: true, formId: parsed.formId || formId };
      } catch (e) {
        const text = e?.message || "Failed to save the draft.";
        setError(text);
        return { ok: false, error: text };
      } finally {
        setBusy(false);
      }
    },
    [applyState, campaignId, formId]
  );

  // Publish always saves first, so it publishes exactly what is on screen.
  async function publish(payload) {
    const saved = await saveDraft(payload);
    if (!saved?.ok) return saved;
    if (!saved.formId) return { ok: false, error: "The draft was saved but the form has no id yet." };

    setBusy(true);
    try {
      await publishAdminForm(saved.formId);
      setStatus("published");
      setHasDraft(false);
      setPublishedAt(new Date().toISOString());
      setMessage({ tone: "ok", text: "Published. This is now the live version." });
      toast.success("Published");
      return { ok: true };
    } catch (e) {
      const text = e?.message || "Failed to publish.";
      setError(text);
      return { ok: false, error: text };
    } finally {
      setBusy(false);
    }
  }

  async function discardDraft() {
    if (!formId) return;

    setBusy(true);
    setError("");
    setMessage(null);

    try {
      await discardAdminSimpleForm(formId);
      const res = await getAdminFormSimple(formId);
      applyState(readPayload(res));
      setMessage({ tone: "ok", text: "Draft discarded. Back to the live version." });
      toast.success("Draft discarded");
    } catch (e) {
      setError(e?.message || "Failed to discard the draft.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="p-4 md:p-6 text-sm text-[#6B7280]">Loading…</div>;
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="hc-animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827]">
            {initialFormId ? "Edit Simple Form" : "Create Simple Form"}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Save draft keeps your work without changing anything live. Publish is what makes it live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {formId && status ? <StatusPill status={status} /> : null}
          <button
            type="button"
            onClick={() => router.push("/admin/forms")}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back to forms
          </button>
        </div>
      </div>

      {error ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <SimpleFormEditor
        initial={content}
        busy={busy}
        hasDraft={hasDraft}
        publishedAt={publishedAt}
        message={message}
        onSubmit={saveDraft}
        onPublish={publish}
        onDiscard={discardDraft}
      />
    </main>
  );
}

const SimpleFormPageClient = () => {
  return (
    <FormEditorGuardProvider>
      <SimpleFormHost />
    </FormEditorGuardProvider>
  );
};

export default SimpleFormPageClient;
