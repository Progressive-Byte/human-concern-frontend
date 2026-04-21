"use client";

export default function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error,
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-[15px] focus:outline-none transition-colors ${
          error
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