import DesignationRowActions from "./DesignationRowActions";
import DesignationStatusPill from "./DesignationStatusPill";

function SkeletonRows() {
  return (
    <div className="space-y-3 px-5 py-4">
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
    </div>
  );
}

const DesignationsTable = ({ items, loading, onEdit, onArchive, onRestore }) => {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Designations ({rows.length})</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No designations found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Designation Code</th>
                <th className="py-3 pr-4">Designation Name</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr
                  key={item?.id || item?.code}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-semibold text-[#111827]">
                      {item?.code || "—"}
                    </span>
                  </td>

                  <td className="py-4 pr-4 align-top font-semibold text-[#111827]">{item?.name || "—"}</td>

                  <td className="py-4 pr-4 align-top">
                    <DesignationStatusPill status={item?.status} />
                  </td>

                  <td className="py-4 pr-5 align-top text-right">
                    <DesignationRowActions item={item} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DesignationsTable;
