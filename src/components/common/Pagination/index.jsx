// components/common/Pagination.jsx
"use client";

const Pagination = ({ current = 1, total = 1, onPageChange }) => {
  const totalPages = Math.max(1, Number(total) || 1);
  const cur = Math.min(Math.max(1, Number(current) || 1), totalPages);

  const go = (page) => {
    const n = Number(page);
    if (!Number.isFinite(n) || n < 1 || n > totalPages || n === cur) return;
    onPageChange?.(n);
  };

  // Build page number array with ellipsis
  const pages = [];
  pages.push(1);
  if (totalPages <= 5) {
    for (let i = 2; i <= totalPages; i++) pages.push(i);
  } else {
    if (cur <= 3) {
      pages.push(2, 3, "...");
    } else if (cur >= totalPages - 2) {
      pages.push("...", totalPages - 2, totalPages - 1);
    } else {
      pages.push("...", cur, "...");
    }
    pages.push(totalPages);
  }

  const btnBase =
    "flex items-center justify-center gap-1 text-[12px] md:text-sm font-normal py-2 px-2.5 md:px-3 min-h-[40px] min-w-[40px] border rounded transition-all cursor-pointer whitespace-nowrap";
  const active  = "border-[#EA3335] bg-[#EA3335] text-white";
  const idle    = "border-gray-200 text-[#383838] hover:border-[#EA3335] hover:text-[#EA3335]";
  const disabled = "border-gray-100 text-gray-300 cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center justify-center gap-[6px]">

      {/* First + Back */}
      <button onClick={() => go(1)}           className={`${btnBase} ${cur > 1 ? idle : disabled} hidden md:flex`}>First</button>
      <button onClick={() => go(cur - 1)}     className={`${btnBase} ${cur > 1 ? idle : disabled}`}>← Back</button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className={`${btnBase} ${disabled}`}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`${btnBase} ${p === cur ? active : idle}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next + Last */}
      <button onClick={() => go(cur + 1)}      className={`${btnBase} ${cur < totalPages ? idle : disabled}`}>Next →</button>
      <button onClick={() => go(totalPages)}   className={`${btnBase} ${cur < totalPages ? idle : disabled} hidden md:flex`}>Last</button>
    </div>
  );
};

export default Pagination;
