import AdminAvatarMenu from "./AdminAvatarMenu";

export default function AdminDashboardHeader({ admin }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Dashboard Overview</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Monitor platform performance and key metrics</p>
      </div>

      <AdminAvatarMenu admin={admin} />
    </div>
  );
}

