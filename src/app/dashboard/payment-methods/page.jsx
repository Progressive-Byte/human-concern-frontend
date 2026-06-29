"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SavedCardsList } from "./components/SavedCardsList";
import { OtherMethodsList } from "./components/OtherMethodsList";
import AddCardModal from "./components/AddCardModal";
import { deleteUserPaymentMethod, getUserPaymentMethods, setUserDefaultPaymentMethod } from "@/services/user";

function normalizeItems(res) {
  const raw = res?.data?.items || res?.data?.data?.items || res?.data?.data || res?.data || {};
  const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  return items;
}

const PaymentMethodsPage = () => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [addOpen, setAddOpen] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await getUserPaymentMethods();
      setItems(normalizeItems(res));
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load payment methods.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const cards = useMemo(() => items.filter((it) => String(it?.type || "").toLowerCase() === "card"), [items]);
  const otherMethods = useMemo(() => {
    const others = items
      .filter((it) => String(it?.type || "").toLowerCase() !== "card")
      .map((it) => ({
        id: it?.id,
        provider: it?.provider,
        icon: String(it?.provider || "").toLowerCase() === "paypal" ? "paypal" : "paypal",
        name: String(it?.provider || "").toLowerCase() === "paypal" ? "PayPal" : "Payment Method",
        desc: it?.email ? `(${it.email})` : "Saved payment method",
        status: "available",
      }));
    return others;
  }, [items]);

  async function handleSetDefault(method) {
    if (!method?.id || busy) return;
    setBusy(true);
    setError("");
    try {
      await setUserDefaultPaymentMethod(method.id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Failed to set default method.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(method) {
    if (!method?.id || busy) return;
    const ok = typeof window !== "undefined" ? window.confirm("Remove this payment method?") : true;
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      await deleteUserPaymentMethod(method.id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Failed to remove method.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DashboardHeader
        title="Payment Methods"
        subtitle="Manage your saved payment methods"
        actions={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer"
          >
            {PlusIcon}
            Add New Card
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {loading ? <div className="text-[13px] text-[#6B7280]">Loading...</div> : null}

        {!loading && cards.length ? <SavedCardsList methods={cards} onSetDefault={handleSetDefault} onRemove={handleRemove} busy={busy} /> : null}

        {!loading && !cards.length ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-6 text-center">
            <div className="text-[13px] font-semibold text-[#111827]">No saved cards yet</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Add a new card to use it for donations and other payments.</div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#111827]/90"
            >
              {PlusIcon}
              Add New Card
            </button>
          </div>
        ) : null}

        <OtherMethodsList methods={otherMethods} />
      </div>

      <AddCardModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          refresh();
        }}
      />
    </>
  );
};

export default PaymentMethodsPage;
