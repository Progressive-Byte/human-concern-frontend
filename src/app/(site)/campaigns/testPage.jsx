"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CampaignCard from "@/components/common/CampaignCard";
import CustomDropdown from "@/components/common/CustomDropdown";
import { SearchIcon, FilterIcon } from "@/components/common/SvgIcon";

// ─── Constants ────────────────────────────────────────────────────────────────

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
].map((cat) => ({ label: cat, value: cat }));   // → [{ label, value }]

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest"      },
  { value: "mostFunded", label: "Most Funded" },
  { value: "endingSoon", label: "Ending Soon" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Read URL (single source of truth) ─────────────────────────────────────
  const search         = searchParams.get("s")       ?? "";
  const activeCategory = searchParams.get("cat")     ?? "All";
  const sortBy         = searchParams.get("orderby") ?? "newest";
  const page           = Number(searchParams.get("page") ?? 1);

  // ── API data state ─────────────────────────────────────────────────────────
  const [campaigns,  setCampaigns]  = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // ── Local UI-only state ────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(search);

  // ── URL updater ────────────────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const isDefault =
          value === "" ||
          value === null ||
          (key === "cat"     && value === "All")    ||
          (key === "orderby" && value === "newest") ||
          (key === "page"    && value === 1);

        isDefault ? params.delete(key) : params.set(key, String(value));
      });

      // Reset to page 1 on any filter / search / sort change
      if (!("page" in updates)) params.delete("page");

      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/campaigns", { scroll: false });
    },
    [searchParams, router]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchSubmit  = ()      => updateParams({ s: searchInput });
  const handleSearchKeyDown = (e)     => { if (e.key === "Enter") handleSearchSubmit(); };
  const handleCategorySelect= (cat)   => updateParams({ cat });
  const handleSortChange    = (value) => updateParams({ orderby: value });
  const handleLoadMore      = ()      => updateParams({ page: page + 1 });

  const handleClearFilters = () => {
    setSearchInput("");
    updateParams({ s: "", cat: "All", orderby: "newest", page: 1 });
  };

  // ── Fetch on param change ──────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search)               params.set("s",       search);
        if (activeCategory !== "All") params.set("cat", activeCategory);
        if (sortBy !== "newest")  params.set("orderby", sortBy);
        if (page > 1)             params.set("page",    String(page));

        const res  = await fetch(`/api/campaigns?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = await res.json();
        setCampaigns(data.campaigns ?? []);
        setTotalCount(data.total    ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    return () => controller.abort();
  }, [search, activeCategory, sortBy, page]);

  // Sync search input on back / forward navigation
  useEffect(() => { setSearchInput(search); }, [search]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const hasFilters = activeCategory !== "All" || search;
  const hasMore    = campaigns.length < totalCount;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="bg-[#F6F6F6] min-h-screen">

      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <div className="bg-[url('/images/bg/cta-bg.png')] bg-cover bg-center bg-no-repeat w-full">
        <div className="max-w-[1611px] mx-auto pt-[140px] pb-[92px] px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-1">
            All Campaigns
          </h1>
          <p className="text-[13px] sm:text-sm text-white mb-6">
            Browse active campaigns and find causes you want to support
          </p>

          {/* ── Search + Filter + Sort row ──────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {SearchIcon}
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchSubmit}
                placeholder="Search campaigns..."
                className="w-full bg-[#FFFFFF40] rounded-full pl-10 pr-4 py-2.5 text-sm font-normal text-white placeholder:text-white outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>

            {/* Category filter — 14 items, scrollable at 260px */}
            <CustomDropdown
              options={CATEGORY_OPTIONS}
              value={activeCategory}
              onChange={handleCategorySelect}
              label="CAMPAIGN CAUSES"
              icon={FilterIcon}
              showDot={activeCategory !== "All"}
              maxHeight="260px"
              width="w-64"
              align="right"
            />

            {/* Sort — 3 items, no scroll needed but cap set for consistency */}
            <CustomDropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={handleSortChange}
              label="SORT BY"
              maxHeight="180px"
              width="w-52"
              align="right"
            />
          </div>
        </div>
      </div>

      {/* ── Results area ──────────────────────────────────────────────── */}
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">

        {/* Status bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            {loading ? (
              "Loading campaigns…"
            ) : (
              <>
                Viewing{" "}
                <span className="font-semibold text-[#383838]">{campaigns.length}</span>{" "}
                campaign{campaigns.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && (
                  <> in{" "}
                    <span className="font-semibold text-[#EA3335]">{activeCategory}</span>
                  </>
                )}
                {search && (
                  <> matching{" "}
                    <span className="font-semibold text-[#383838]">"{search}"</span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-10 text-sm text-red-500">
            Something went wrong: {error}
          </div>
        )}

        {/* Cards */}
        {!error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[#383838] mb-2">
              No campaigns found
            </h3>
            <p className="text-sm text-[#737373] max-w-xs">
              Try adjusting your search or filters.
            </p>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Load more */}
        {!loading && !error && hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 border border-gray-300 rounded-full text-sm font-medium text-[#383838] hover:border-[#EA3335] hover:text-[#EA3335] transition-all duration-200"
            >
              Load more campaigns
            </button>
          </div>
        )}
      </div>
    </main>
  );
}