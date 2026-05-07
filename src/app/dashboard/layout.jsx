import DashboardSidebar from "./components/DashboardSidebar";

export const metadata = {
  title: "Dashboard — Human Concern",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F9F9F9] text-[#383838]">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
