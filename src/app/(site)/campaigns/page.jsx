"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CampaignCard from "@/components/common/CampaignCard";
import CustomDropdown from "@/components/common/CustomDropdown";
import { FilterIcon, SearchIcon } from "@/components/common/SvgIcon";

// ─── Static data (swap with API later) ────────────────────────────────────────

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

// ─── Dropdown option arrays ────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
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
].map((cat) => ({ label: cat, value: cat }));

const SORT_OPTIONS = [
  { label: "Newest",      value: "newest"     },
  { label: "Most Funded", value: "mostFunded" },
  { label: "Ending Soon", value: "endingSoon" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const CampaignsPage = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Read from URL ────────────────────────────────────────────────────────
  const urlSearch   = searchParams.get("s")       ?? "";
  const urlCategory = searchParams.get("cat")     ?? "All";
  const urlSort     = searchParams.get("orderby") ?? "newest";

  // ── Local state (mirrors URL) ────────────────────────────────────────────
  const [searchInput,    setSearchInput]    = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy,         setSortBy]         = useState(urlSort);

  // Sync state on back / forward navigation
  useEffect(() => {
    setSearchInput(urlSearch);
    setActiveCategory(urlCategory);
    setSortBy(urlSort);
  }, [urlSearch, urlCategory, urlSort]);

  // ── URL writer ───────────────────────────────────────────────────────────
  const updateURL = (s, cat, sort) => {
    const params = new URLSearchParams();
    if (s)               params.set("s",       s);
    if (cat !== "All")   params.set("cat",     cat);
    if (sort !== "newest") params.set("orderby", sort);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    updateURL(val, activeCategory, sortBy);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    updateURL(searchInput, cat, sortBy);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    updateURL(searchInput, activeCategory, val);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setActiveCategory("All");
    setSortBy("newest");
    router.replace(pathname);
  };

  // ── Filter + sort (replace with API later) ───────────────────────────────
  const filtered = ALL_CAMPAIGNS.filter((c) => {
    const matchCat    = activeCategory === "All" || c.category === activeCategory;
    const matchSearch = !searchInput || c.title.toLowerCase().includes(searchInput.toLowerCase()) || c.description.toLowerCase().includes(searchInput.toLowerCase());
    return matchCat && matchSearch;
  });

  const sortedCampaigns = [...filtered].sort((a, b) => {
    if (sortBy === "mostFunded") return b.raised - a.raised;
    if (sortBy === "endingSoon") return a.daysLeft - b.daysLeft;
    return 0;
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="bg-[#F6F6F6] min-h-screen">

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="bg-[url('/images/bg/cta-bg.png')] bg-cover bg-center bg-no-repeat w-full">
        <div className="max-w-[1611px] mx-auto pt-[140px] pb-[92px] px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-1">
            All Campaigns
          </h1>
          <p className="text-[13px] sm:text-sm text-white mb-6">
            Browse active campaigns and find causes you want to support
          </p>

          {/* Search + Filter + Sort row */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search input */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {SearchIcon}
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search campaigns..."
                className="w-full bg-[#FFFFFF40] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>

            {/* Category filter dropdown */}
            <CustomDropdown
              options={CATEGORY_OPTIONS}
              value={activeCategory}
              onChange={handleCategoryChange}
              label="CAMPAIGN CAUSES"
              icon={FilterIcon}
              showDot={activeCategory !== "All"}
              maxHeight="260px"
              width="w-64"
            />

            {/* Sort dropdown */}
            <CustomDropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={handleSortChange}
              label="SORT BY"
              maxHeight="180px"
              width="w-52"
            />
          </div>
        </div>
      </div>

      {/* ── Results area ─────────────────────────────────────────────── */}
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">

        {/* Count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            Viewing{" "}
            <span className="font-semibold text-[#383838]">{sortedCampaigns.length}</span>{" "}
            campaign{sortedCampaigns.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && (
              <> in <span className="font-semibold text-[#EA3335]">{activeCategory}</span></>
            )}
            {searchInput && (
              <> matching <span className="font-semibold text-[#383838]">"{searchInput}"</span></>
            )}
          </p>
        </div>

        {/* Grid */}
        {sortedCampaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {sortedCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <button className="px-8 py-3 border border-gray-300 rounded-full text-sm font-medium text-[#383838] hover:border-[#EA3335] hover:text-[#EA3335] transition-all duration-200">
                Load more campaigns
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[#383838] mb-2">No campaigns found</h3>
            <p className="text-sm text-[#737373] max-w-xs">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={handleClearAll}
              className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
export default CampaignsPage;