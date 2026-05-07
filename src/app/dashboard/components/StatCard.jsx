import Image from "next/image";
import { isValidElement } from "react";

/**
 * StatCard
 *
 * Renders a single statistic card used at the top of the dashboard.
 *
 * Props:
 * - label  : caption text shown above the value (e.g. "Total Donated")
 * - value  : the large numeric/text value
 * - hint   : small helper text shown below the value
 * - icon   : either a string path (rendered with next/image) OR a ReactElement
 *            (rendered inside a circular container)
 * - accent : optional accent color (hex) for the icon container background
 */
const StatCard = ({ label, value, hint, icon, accent = "#055A46", bgColor = "#FFFFFF", borderColor }) => {
  const isReactIcon = isValidElement(icon);

  return (
    <div
      className="rounded-2xl border p-[25px] hover:shadow-sm transition-shadow"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor ?? "rgba(38, 38, 38, 0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#737373]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A1A] truncate">{value}</p>
          {hint && <p className="mt-[10px] text-sm text-[#737373]">{hint}</p>}
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
