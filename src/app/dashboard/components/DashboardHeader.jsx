"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Common header used by every dashboard page.
 * Pages can override the title/subtitle, otherwise it greets the logged-in user.
 *
 * Props:
 *  - title?: string
 *  - subtitle?: string
 *  - actions?: ReactNode  (right-aligned, e.g. an Export CSV button)
 */
export default function DashboardHeader({ title, subtitle, actions }) {
  const { user } = useAuth();
  const displayName = user?.name || user?.firstName || "there";

  const heading = title ?? `Welcome back, ${displayName}`;
  const sub = subtitle ?? "Here's an overview of your giving journey";

  return (
    <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-white">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{heading}</h1>
        {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
