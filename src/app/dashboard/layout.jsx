import DashboardSidebar from "./components/DashboardSidebar";

export const metadata = {
  title: "Dashboard — Human Concern",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
