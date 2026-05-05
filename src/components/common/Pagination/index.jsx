// components/common/Pagination.jsx
"use client";

const Pagination = ({ current = 1, total = 1, onPageChange }) => {
  const go = (page) => {
    if (page < 1 || page > total || page === current) return;
    onPageChange?.(page);
  };

  // Build page number array with ellipsis
  const pages = [];
  pages.push(1);
  if (total <= 5) {
    for (let i = 2; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(2, 3, "...");
    } else if (current >= total - 2) {
      pages.push("...", total - 2, total - 1);
    } else {
      pages.push("...", current, "...");
    }
    pages.push(total);
  }

  const btnBase =
    "flex items-center gap-1 text-[10px] md:text-sm font-normal py-2 px-3 border rounded transition-all cursor-pointer";
  const active  = "border-[#EA3335] bg-[#EA3335] text-white";
  const idle    = "border-gray-200 text-[#383838] hover:border-[#EA3335] hover:text-[#EA3335]";
  const disabled = "border-gray-100 text-gray-300 cursor-not-allowed";

  return (
    <div className="flex items-center gap-[6px]">

      {/* First + Back */}
      <button onClick={() => go(1)}           className={`${btnBase} ${current > 1 ? idle : disabled} hidden md:flex`}>First</button>
      <button onClick={() => go(current - 1)} className={`${btnBase} ${current > 1 ? idle : disabled}`}>← Back</button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className={`${btnBase} ${disabled}`}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`${btnBase} ${p === current ? active : idle}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next + Last */}
      <button onClick={() => go(current + 1)} className={`${btnBase} ${current < total ? idle : disabled}`}>Next →</button>
      <button onClick={() => go(total)}        className={`${btnBase} ${current < total ? idle : disabled} hidden md:flex`}>Last</button>
    </div>
  );
};

export default Pagination;