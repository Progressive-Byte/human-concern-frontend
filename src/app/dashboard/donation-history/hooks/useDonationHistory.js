import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserDonationsList } from "@/services/donationService";
import { formatDate } from "../utils";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const DEFAULT_CAUSE_OPTIONS = [{ value: "all", label: "All Causes" }];

export function useDonationHistory(search, cause) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [causeOptions, setCauseOptions] = useState(DEFAULT_CAUSE_OPTIONS);
  const [showPopup, setShowPopup] = useState(false);
  const [thankyouData, setThankyouData] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (searchParams.get("thankyou") !== "1") return;
    try {
      const raw = sessionStorage.getItem("thankyouData");
      if (raw) {
        setThankyouData(JSON.parse(raw));
        setShowPopup(true);
        sessionStorage.removeItem("thankyouData");
      }
    } catch {}
    router.replace("/dashboard/donation-history", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserDonationsList({
          page: "1", limit: "50", q: debouncedSearch,
          filter: cause, sort: "date", order: "desc",
        });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const rawCauses = res?.meta?.filters?.causes || res?.data?.meta?.filters?.causes || [];
        setItems(nextItems);
        const opts = (Array.isArray(rawCauses) ? rawCauses : [])
          .map((c) => ({
            value: String(c?.key || "").trim(),
            label: `${String(c?.label || "Cause")}${typeof c?.count === "number" ? ` (${c.count})` : ""}`,
          }))
          .filter((o) => o.value);
        setCauseOptions(opts.length ? opts : DEFAULT_CAUSE_OPTIONS);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setCauseOptions(DEFAULT_CAUSE_OPTIONS);
        setError(e?.message || "Failed to load donations.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedSearch, cause]);

  const rows = useMemo(() =>
    (Array.isArray(items) ? items : []).map((it, idx) => ({
      id:        String(it?.donationId || idx),
      date:      formatDate(it?.date) || "—",
      campaign:  String(it?.campaign?.name || "").trim() || "—",
      cause:     String(it?.causeTag?.label || "").trim() || "—",
      amount:    Number(it?.amount ?? 0),
      currency:  String(it?.currency || "USD"),
      status:    String(it?.status?.label || "").trim() || "—",
      statusKey: String(it?.status?.key || ""),
    })),
  [items]);

  return { loading, error, setError, rows, causeOptions, debouncedSearch, showPopup, setShowPopup, thankyouData };
}
