export default function FormsPreviewChips({ items = [] }) {
  const rows = Array.isArray(items) ? items : [];
  if (rows.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {rows.slice(0, 3).map((f) => (
        <span
          key={f?.formId || f?.name}
          className="inline-flex items-center rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] text-[#111827]"
        >
          {f?.name || "—"}
        </span>
      ))}
    </div>
  );
}

