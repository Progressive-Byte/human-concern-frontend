export const DONUT_R      = 75;
export const DONUT_STROKE = 30;
export const DONUT_C      = 2 * Math.PI * DONUT_R;
export const DONUT_GAP    = 4;

const KNOWN_COLORS = {
  Zakat:              { color: "#047857", bg: "#ECFDF5" },
  Sadaqah:            { color: "#B45309", bg: "#FFF8EC" },
  "Emergency Relief": { color: "#EA3335", bg: "#FFF5F5" },
  Fitrana:            { color: "#1D4ED8", bg: "#EFF6FF" },
  Other:              { color: "#6B7280", bg: "#F3F4F6" },
};

const COLOR_PALETTE = [
  { color: "#047857", bg: "#ECFDF5" },
  { color: "#B45309", bg: "#FFF8EC" },
  { color: "#EA3335", bg: "#FFF5F5" },
  { color: "#1D4ED8", bg: "#EFF6FF" },
  { color: "#6B7280", bg: "#F3F4F6" },
];

export function colorFor(label, index) {
  return KNOWN_COLORS[label] || COLOR_PALETTE[index % COLOR_PALETTE.length];
}
