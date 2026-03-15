export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 ${className}`.trim()}
      {...props}
    />
  );
}
