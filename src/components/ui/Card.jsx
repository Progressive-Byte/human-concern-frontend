export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
