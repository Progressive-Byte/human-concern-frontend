"use client";

export default function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error,
  required,
  readOnly,
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#111827] mb-1.5 block">
        {label}
        {required && <span className="text-[#EA3335] ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full border border-dashed rounded-xl px-4 py-3 text-[15px] focus:outline-none transition-colors ${
          readOnly
            ? "border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] cursor-default"
            : error
            ? "border-[#EA3335] focus:border-[#EA3335]"
            : "border-[#E5E7EB] focus:border-[#EA3335]/60"
        }`}
      />

      {error && (
        <p className="text-[#EA3335] text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}
