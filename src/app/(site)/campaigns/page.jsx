"use client";

import { useState } from "react";
import CampaignCard from "@/components/common/CampaignCard";
import Link from "next/link";

// ─── Static data ──────────────────────────────────────────────────────────────

const ALL_CAMPAIGNS = [
  {
    id: 1,
    category: "Emergency",
    tag: "Zakat Eligible",
    title: "Ramadan Food Distribution",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 45000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 2,
    category: "Emergency",
    tag: "Zakat Eligible",
    title: "Emergency Relief: Earthquake",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 128000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 3,
    category: "Clean Water",
    tag: "Zakat Eligible",
    title: "Clean Water Wells Project",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 18500,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 4,
    category: "Emergency",
    tag: "Zakat Eligible",
    title: "Emergency Relief: Earthquake",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 128000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 5,
    category: "Clean Water",
    tag: "Zakat Eligible",
    title: "Clean Water Wells Project",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 18500,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 6,
    category: "Emergency",
    tag: "Zakat Eligible",
    title: "Ramadan Food Distribution",
    description:
      "Urgent aid for earthquake victims. Providing shelter, medical supplies, and food to affected families.",
    raised: 45000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
];

const CATEGORIES = ["All", "Emergency", "Clean Water", "Education", "Healthcare"];

// ─── Search icon ──────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Filter + search
  const filtered = ALL_CAMPAIGNS.filter((c) => {
    const matchCategory =
      activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="bg-[#F6F6F6] min-h-screen">

      {/* ── Dark hero banner ─────────────────────────────────────────── */}
      <div className="bg-[#1A1A1A] pt-[120px] pb-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-1">
            All Campaigns
          </h1>
          <p className="text-[13px] sm:text-sm text-white/50 mb-6">
            Browse active campaigns and find causes you want to support
          </p>

          {/* Search + filter row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search bar */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full bg-[#2E2E2E] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25 transition-colors"
              />
            </div>

            {/* Filter button */}
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2E2E2E] border border-white/10 rounded-lg text-white/70 text-sm hover:bg-[#3a3a3a] transition-colors shrink-0">
              <FilterIcon />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-[#2E2E2E] border border-white/10 rounded-lg text-white/70 text-sm outline-none hover:bg-[#3a3a3a] transition-colors cursor-pointer shrink-0"
            >
              <option value="newest">Newest</option>
              <option value="mostFunded">Most Funded</option>
              <option value="endingSoon">Ending Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Category tabs ──────────────────────────────────────────────── */}
      <div className="bg-[#F6F6F6] border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#EA3335] text-white"
                  : "text-[#737373] hover:text-[#383838] hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results area ───────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            Viewing{" "}
            <span className="font-semibold text-[#383838]">{filtered.length}</span>{" "}
            campaign{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && (
              <> for{" "}
                <span className="font-semibold text-[#EA3335]">{activeCategory}</span>
              </>
            )}
            {search && (
              <> matching{" "}
                <span className="font-semibold text-[#383838]">"{search}"</span>
              </>
            )}
          </p>

          {/* Like counter pill — matching design */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 shadow-sm">
            <span className="text-[13px] font-semibold text-[#383838]">1663</span>
            <span className="w-5 h-5 rounded-full bg-[#4A90D9] flex items-center justify-center shrink-0">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-[#383838]">532</span>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[#383838] mb-2">No campaigns found</h3>
            <p className="text-sm text-[#737373] max-w-xs">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Load more — placeholder */}
        {filtered.length > 0 && (
          <div className="flex justify-center mt-12">
            <button className="px-8 py-3 border border-gray-300 rounded-full text-sm font-medium text-[#383838] hover:border-[#EA3335] hover:text-[#EA3335] transition-all duration-200">
              Load more campaigns
            </button>
          </div>
        )}
      </div>
    </main>
  );
}