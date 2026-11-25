"use client";

const Field = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "",
  type = "text",
  error,
  required,
  readOnly,
}) => {
  return (
    <div>
      {label ? (
        <label className="text-[12px] sm:text-[13px] font-medium text-[#111827] mb-1 block sm:mb-1.5">
          {label}
          {required && <span className="text-[#EA3335] ml-0.5">*</span>}
        </label>
      ) : null}

      <input
        type={type}
        value={value}
        onChange={readOnly ? undefined : onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full border border-solid rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-[13px] sm:text-[16px] focus:outline-none transition-colors ${
          readOnly
            ? "border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] cursor-default"
            : error
            ? "border-[#EA3335] focus:border-[#EA3335]"
            : "border-[#E5E7EB] focus:border-[#EA3335]/60"
        }`}
      />

      {error && (
        <p className="text-red-600 text-[12px] mt-1">{error}</p>
      )}
    </div>
  );
}
export default Field;