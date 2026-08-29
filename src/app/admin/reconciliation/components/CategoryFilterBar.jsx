"use client";

import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import { DISCREPANCY_CATEGORIES } from "@/utils/errorMaps";

const CATEGORY_ORDER = [
  "ALL",
  DISCREPANCY_CATEGORIES.MATCHED,
  DISCREPANCY_CATEGORIES.AMOUNT_MISMATCH,
  DISCREPANCY_CATEGORIES.MISSING_IN_LOCAL,
  DISCREPANCY_CATEGORIES.MISSING_IN_PROVIDER,
  DISCREPANCY_CATEGORIES.STATUS_MISMATCH,
  DISCREPANCY_CATEGORIES.THREE_DS_AUDIT_MISMATCH,
  DISCREPANCY_CATEGORIES.OTHER,
  DISCREPANCY_CATEGORIES.RESOLVED,
];

function countFor(categoriesCounts, key) {
  if (!categoriesCounts || typeof categoriesCounts !== "object") return null;
  if (key === "ALL") return null;
  const k = String(key || "");
  const direct = categoriesCounts[k];
  if (direct !== undefined && direct !== null) return Number(direct);
  const altKeys = Object.keys(categoriesCounts).filter(
    (ck) => String(ck).toUpperCase().replace(/[^A-Z0-9]/g, "_") === k.toUpperCase().replace(/[^A-Z0-9]/g, "_")
  );
  if (altKeys.length > 0 && categoriesCounts[altKeys[0]] !== undefined) {
    return Number(categoriesCounts[altKeys[0]]);
  }
  return null;
}

const CategoryFilterBar = ({ selected = "ALL", onChange, counts = null }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CATEGORY_ORDER.map((cat) => {
        const active = String(selected || "ALL") === String(cat || "ALL");
        const n = countFor(counts, cat);
        return (
          <button
            key={cat || "ALL"}
            type="button"
            onClick={() => onChange?.(cat || "ALL")}
            className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
              active
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-dashed border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
            }`}
          >
            <span className={active ? "opacity-90" : ""}>
              {cat === "ALL" ? (
                <span className="inline-flex items-center">All</span>
              ) : (
                <OrchestrationStatusBadge type="category" value={cat} />
              )}
            </span>
            {n !== null && !Number.isNaN(n) ? (
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 text-[11px] ${
                  active ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#111827]"
                }`}
              >
                {n}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilterBar;
