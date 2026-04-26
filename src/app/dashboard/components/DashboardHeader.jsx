"use client";

import { useAuth } from "@/context/AuthContext";


const DashboardHeader = ({ title, subtitle, actions }) => {
  const { user } = useAuth();
  const displayName = user?.name || user?.firstName || "there";

  const heading = title ?? `Welcome back, ${displayName}`;
  const sub = subtitle ?? "Here's an overview of your giving journey";

  return (
    <header className="flex items-start justify-between gap-4 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{heading}</h1>
        {sub && <p className="mt-1 text-[16px] text-[#737373]">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export default DashboardHeader
