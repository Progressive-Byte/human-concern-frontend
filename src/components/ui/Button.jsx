export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
