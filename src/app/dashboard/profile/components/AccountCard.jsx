export function AccountCard() {
  return (
    <section className="bg-white rounded-2xl border border-dashed border-[#EA3335]/20 p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827]">Account</h2>

      <div className="mt-4 flex items-center justify-between gap-4 px-4 py-4 rounded-xl bg-[#FFF5F5] border border-dashed border-[#EA3335]/15">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#EA3335]">Deactivate Account</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Temporarily archive your account and all data</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer"
        >
          Contact Support
        </button>
      </div>
    </section>
  );
}
