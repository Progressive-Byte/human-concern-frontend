"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CampaignCard from "@/components/common/CampaignCard";
import { ArrowDownIcon, FilterIcon, SearchIcon } from "@/components/common/SvgIcon";

const ALL_CAMPAIGNS = [
  {
    id: 1,
    category: "Emergency Relief",
    tag: "Zakat Eligible",
    title: "Ramadan Food Distribution",
    description: "Urgent food aid for families in need during Ramadan.",
    raised: 45000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 2,
    category: "Emergency Relief",
    tag: "Zakat Eligible",
    title: "Earthquake Emergency Relief",
    description: "Providing shelter, medical supplies, and food to earthquake victims.",
    raised: 128000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 3,
    category: "Clean Water & Sanitation",
    tag: "Zakat Eligible",
    title: "Clean Water Wells Project",
    description: "Building sustainable clean water wells in rural communities.",
    raised: 18500,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 4,
    category: "Education",
    tag: "Sadaqa Jariyah",
    title: "Sponsor a Child's Education",
    description: "Help provide quality education to underprivileged children.",
    raised: 67200,
    goal: 150000,
    donors: 845,
    daysLeft: 45,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 5,
    category: "Health",
    tag: "Zakat Eligible",
    title: "Medical Aid for the Poor",
    description: "Providing essential healthcare and medicines to needy families.",
    raised: 32500,
    goal: 100000,
    donors: 670,
    daysLeft: 25,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 6,
    category: "Food Aid",
    tag: "Zakat Eligible",
    title: "Monthly Food Baskets",
    description: "Delivering nutritious food packages to struggling families.",
    raised: 89000,
    goal: 120000,
    donors: 1450,
    daysLeft: 18,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 7,
    category: "Zabiha",
    tag: "Zakat Eligible",
    title: "Qurbani / Zabiha Campaign",
    description: "Perform Qurbani for families who cannot afford it.",
    raised: 67000,
    goal: 250000,
    donors: 980,
    daysLeft: 12,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 8,
    category: "Child Sponsorship",
    tag: "Sadaqa",
    title: "Orphan Child Sponsorship",
    description: "Sponsor an orphan child with monthly support and education.",
    raised: 45000,
    goal: 80000,
    donors: 520,
    daysLeft: 60,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 9,
    category: "Sadaqa Jariyah",
    tag: "Sadaqa Jariyah",
    title: "Build a Masjid",
    description: "Ongoing charity project to build a mosque in a remote village.",
    raised: 125000,
    goal: 300000,
    donors: 890,
    daysLeft: 90,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 10,
    category: "Livelihoods",
    tag: "Zakat Eligible",
    title: "Vocational Training Program",
    description: "Empowering women with skills and small business support.",
    raised: 28000,
    goal: 75000,
    donors: 310,
    daysLeft: 40,
    org: "MTIWA LTD, Ca",
  },
];

const CATEGORIES = [
  "All",
  "Sadaqa/General",
  "Zakat",
  "Emergency Relief",
  "Child Sponsorship",
  "Zabiha",
  "Clean Water & Sanitation",
  "Education",
  "Fidyah & Kaffara",
  "Zakat Al Fitr",
  "Health",
  "Livelihoods",
  "Sadaqa Jariyah",
  "Food Aid",
];


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get values from URL query string
  const urlSearch = searchParams.get("s") || "";
  const urlCategory = searchParams.get("cat") || "All";
  const urlSort = searchParams.get("orderby") || "newest";

  const [search, setSearch] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState(urlSort);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Update URL when filters change
  const updateURL = (newSearch, newCategory, newSort) => {
    const params = new URLSearchParams();

    if (newSearch) params.set("s", newSearch);
    if (newCategory && newCategory !== "All") params.set("cat", newCategory);
    if (newSort && newSort !== "newest") params.set("orderby", newSort);

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? "?" + queryString : ""}`, { scroll: false });
  };

  // Sync state when URL changes (back/forward navigation)
  useEffect(() => {
    setSearch(urlSearch);
    setActiveCategory(urlCategory);
    setSortBy(urlSort);
  }, [urlSearch, urlCategory, urlSort]);

  // Filter + Search
  const filtered = ALL_CAMPAIGNS.filter((c) => {
    const matchCategory = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Sorting
  const sortedCampaigns = [...filtered].sort((a, b) => {
    if (sortBy === "mostFunded") return b.raised - a.raised;
    if (sortBy === "endingSoon") return a.daysLeft - b.daysLeft;
    return 0; // newest (you can improve later with real date)
  });

  // Handle Search Input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    updateURL(value, activeCategory, sortBy);
  };

  // Handle Category Change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setShowFilterDropdown(false);
    updateURL(search, cat, sortBy);
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    updateURL(search, activeCategory, value);
  };

  return (
    <main className="bg-[#F6F6F6] min-h-screen">
      {/* Dark Hero Banner */}
      <div className="bg-[url('/images/bg/cta-bg.png')] bg-cover bg-center bg-no-repeat w-full ">
        <div className="max-w-[1611px] mx-auto pt-[140px] pb-[92px] px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-1">
            All Campaigns
          </h1>
          <p className="text-[13px] sm:text-sm text-white/50 mb-6">
            Browse active campaigns and find causes you want to support
          </p>

          {/* Search + Filter + Sort */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {SearchIcon}
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search campaigns..."
                className="w-full bg-[#FFFFFF40] rounded-full pl-10 pr-4 py-2.5 text-sm font-normal text-white placeholder:text-white outline-none focus:border-white/25 transition-colors"
              />
            </div>

            {/* Filter Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-8 py-2.5 bg-[#FFFFFF] border border-[#CCCCCC] rounded-full text-white/70 text-sm"
              >
                {FilterIcon}
                <span className="hidden text-[#1A1A1A] sm:inline">All {ArrowDownIcon}</span>
                {activeCategory !== "All" && <span className="ml-1 text-[#EA3335] font-medium">•</span>}
              </button>

              {/* Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-[70vh] overflow-auto">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                    CAMPAIGN CAUSES
                  </div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                        activeCategory === cat ? "bg-gray-50 text-[#EA3335] font-medium" : "text-gray-700"
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && <span className="text-[#EA3335]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-2.5 bg-[#2E2E2E] border border-white/10 rounded-lg text-white/70 text-sm outline-none hover:bg-[#3a3a3a] transition-colors cursor-pointer shrink-0"
            >
              <option value="newest">Newest</option>
              <option value="mostFunded">Most Funded</option>
              <option value="endingSoon">Ending Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            Viewing{" "}
            <span className="font-semibold text-[#383838]">{sortedCampaigns.length}</span>{" "}
            campaign{sortedCampaigns.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && (
              <> in <span className="font-semibold text-[#EA3335]">{activeCategory}</span></>
            )}
            {search && (
              <> matching <span className="font-semibold text-[#383838]">"{search}"</span></>
            )}
          </p>
        </div>

        {sortedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sortedCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[#383838] mb-2">No campaigns found</h3>
            <p className="text-sm text-[#737373] max-w-xs">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setSortBy("newest");
                router.replace(pathname);
              }}
              className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {sortedCampaigns.length > 0 && (
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