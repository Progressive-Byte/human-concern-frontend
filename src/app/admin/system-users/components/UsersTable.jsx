import UserRowActions from "./UserRowActions";
import UserStatusPill from "./UserStatusPill";
import RoleBadge from "./RoleBadge";

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

function PaginationBar({ pagination, onPrev, onNext }) {
  if (!pagination) return null;

  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[12px] text-[#6B7280]">
        Page <span className="font-semibold text-[#111827]">{page}</span> of{" "}
        <span className="font-semibold text-[#111827]">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const UsersTable = ({ items, loading, pagination, onPrevPage, onNextPage, onEdit, onResetPassword, onSetStatus }) => {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All System Users</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No system users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Roles</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Last Login</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr
                  key={item?.id || item?.email}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-[#111827]">{item?.name || "—"}</div>
                  </td>

                  <td className="py-4 pr-4 align-top text-[#6B7280]">{item?.email || "—"}</td>

                  <td className="py-4 pr-4 align-top">
                    {item?.roles?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.roles.map((role) => (
                          <RoleBadge key={role.id || role.key} role={role} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">No roles</span>
                    )}
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <UserStatusPill status={item?.status} />
                  </td>

                  <td className="py-4 pr-4 align-top text-[#6B7280]">{formatDateTime(item?.lastLoginAt)}</td>

                  <td className="py-4 pr-5 align-top text-right">
                    <UserRowActions
                      item={item}
                      onEdit={onEdit}
                      onResetPassword={onResetPassword}
                      onSetStatus={onSetStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
};

export default UsersTable;
