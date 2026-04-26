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
      <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">
        {label}
        {required && <span className="text-[#EA3335] ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-[15px] focus:outline-none transition-colors ${
          readOnly
            ? "border-[#E0E0E0] bg-[#F5F5F5] text-[#888888] cursor-default"
            : error
            ? "border-[#EA3335] focus:border-[#EA3335]"
            : "border-[#CCCCCC] focus:border-[#055A46]"
        }`}
      />

      {error && (
        <p className="text-[#EA3335] text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}