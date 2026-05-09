import Image from "next/image";
import { isValidElement } from "react";

const StatCard = ({ label, value, hint, icon, accent = "#EA3335", bgColor = "#FFFFFF", borderColor }) => {
  const isReactIcon = isValidElement(icon);

  return (
    <div
      className="rounded-2xl border border-dashed p-[25px] hover:shadow-sm transition-shadow"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor ?? "#E5E7EB",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#6B7280]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#111827] truncate">{value}</p>
          {hint && <p className="mt-[10px] text-sm text-[#6B7280]">{hint}</p>}
        </div>

        {icon && (
          <div className="shrink-0">
            {isReactIcon ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${accent}1A`, color: accent }}
              >
                {icon}
              </div>
            ) : (
              <Image
                src={icon}
                alt={label}
                width={63}
                height={48}
                className="object-contain"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
