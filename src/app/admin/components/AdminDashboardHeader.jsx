import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";

const AdminDashboardHeader = ({ admin }) => {
  return (
    <div className="hc-animate-fade-up flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">
          Dashboard Overview <span className="hc-admin-brand-text">•</span>
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Monitor platform performance and key metrics</p>
      </div>

      <div className="flex items-center gap-2">
        <AdminHeaderActions admin={admin} />
      </div>
    </div>
  );
}

export default AdminDashboardHeader
