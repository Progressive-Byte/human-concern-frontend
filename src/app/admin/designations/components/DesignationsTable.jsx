"use client";

const HEAD_CLASS = "px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[#8C8C8C]";
const CELL_CLASS = "px-4 py-3 text-[13px] text-[#383838]";

const DesignationsTable = ({
  items = [],
  loading,
  pagination,
  busyId,
  onEdit,
  onToggleStatus,
  onPrevPage,
  onNextPage,
}) => {
  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);

  return (
    <div className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="border-b border-[#F1F1F1] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#171717]">All designations</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#F1F1F1] bg-[#FAFAFA]">
              <th className={HEAD_CLASS}>Designation code</th>
              <th className={HEAD_CLASS}>Designation name</th>
              <th className={HEAD_CLASS}>Status</th>
              <th className={`${HEAD_CLASS} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[#8C8C8C]">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[#8C8C8C]">
                  No designations match these filters.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const archived = String(row.status) === "archived";
                const busy = busyId === row.id;
                return (
                  <tr key={row.id} className="border-b border-[#F6F6F6] last:border-0 hover:bg-[#FCFCFC]">
                    <td className={`${CELL_CLASS} font-medium text-[#171717]`}>{row.code}</td>
                    <td className={CELL_CLASS}>{row.name}</td>
                    <td className={CELL_CLASS}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          archived ? "bg-[#F3F4F6] text-[#6B7280]" : "bg-[#ECFDF5] text-[#047857]"
                        }`}
                      >
                        {archived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className={`${CELL_CLASS} text-right`}>
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="cursor-pointer text-[12px] font-medium text-[#171717] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onToggleStatus(row)}
                          className="cursor-pointer text-[12px] font-medium text-[#EA3335] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? "…" : archived ? "Restore" : "Archive"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F1F1] px-4 py-3">
        <p className="text-[12px] text-[#8C8C8C]">
          {total} {total === 1 ? "designation" : "designations"}
          {totalPages > 1 ? ` · page ${currentPage} of ${totalPages}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignationsTable;
