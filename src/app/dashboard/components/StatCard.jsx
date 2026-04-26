const StatCard = ({ label, value, hint, icon }) => {
  return (
    <div className="rounded-2xl border border-[#26262633] bg-[#2626260D] p-[25px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#737373]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A1A]">{value}</p>
          {hint && <p className="mt-[10px] text-sm text-[#737373]">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard