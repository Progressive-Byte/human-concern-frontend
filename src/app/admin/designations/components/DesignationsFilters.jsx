"use client";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#383838] outline-none transition focus:border-[#171717]/30";

const DesignationsFilters = ({ q, onChangeQ, status, onChangeStatus, onReset }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="md:col-span-2">
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">Search</label>
        <input
          value={q}
          onChange={(event) => onChangeQ(event.target.value)}
          placeholder="Designation name or code…"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">Status</label>
        <select
          value={status}
          onChange={(event) => onChangeStatus(event.target.value)}
          className={`${INPUT_CLASS} cursor-pointer bg-white`}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer text-[12px] font-medium text-[#EA3335] hover:underline"
      >
        Reset filters
      </button>
    </div>
  </div>
);

export default DesignationsFilters;
