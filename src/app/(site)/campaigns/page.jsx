"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CampaignCard from "@/components/common/CampaignCard";
import CustomDropdown from "@/components/common/CustomDropdown";
import Pagination from "@/components/common/Pagination";
import { FilterIcon, SearchIcon } from "@/components/common/SvgIcon";
import { apiBase } from "@/utils/constants";

// ─── Constants ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Newest", value: "new_first" },
  { label: "Oldest", value: "old_first" },
  { label: "A → Z",  value: "a_to_z"   },
  { label: "Z → A",  value: "z_to_a"   },
];

const ALL_OPTION = { label: "All", value: "" };
const PAGE_SIZE  = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAPIParams({ q, categoryId, causeId, sort, page }) {
  const p = new URLSearchParams();
  p.set("page",  String(page));
  p.set("limit", String(PAGE_SIZE));
  if (q)          p.set("q",          q);
  if (categoryId) p.set("categoryId",  categoryId);
  if (causeId)    p.set("causeId",     causeId);
  if (sort)       p.set("sort",        sort);
  return p.toString();
}

function buildURLParams({ q, categoryId, causeId, sort, page }) {
  const p = new URLSearchParams();
  if (q)                    p.set("q",          q);
  if (categoryId)           p.set("categoryId",  categoryId);
  if (causeId)              p.set("causeId",     causeId);
  if (sort !== "new_first") p.set("sort",        sort);
  if (page > 1)             p.set("page",        String(page));
  return p.toString();
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CampaignsPage = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter state from URL
  const urlSearch     = searchParams.get("q")          ?? "";
  const urlCategoryId = searchParams.get("categoryId") ?? "";
  const urlCauseId    = searchParams.get("causeId")    ?? "";
  const urlSort       = searchParams.get("sort")       ?? "new_first";
  const urlPage       = parseInt(searchParams.get("page") ?? "1", 10);

  // UI filter state (controlled inputs)
  const [searchInput,      setSearchInput]      = useState(urlSearch);
  const [activeCategoryId, setActiveCategoryId] = useState(urlCategoryId);
  const [activeCauseId,    setActiveCauseId]    = useState(urlCauseId);
  const [sortBy,           setSortBy]           = useState(urlSort);
  const [currentPage,      setCurrentPage]      = useState(urlPage);

  // Data state
  const [campaigns,  setCampaigns]  = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);

  // Dropdown options
  const [categories, setCategories] = useState([ALL_OPTION]);
  const [causes,     setCauses]     = useState([ALL_OPTION]);

  // ── Sync local state when browser back/forward changes URL
  useEffect(() => {
    setSearchInput(urlSearch);
    setActiveCategoryId(urlCategoryId);
    setActiveCauseId(urlCauseId);
    setSortBy(urlSort);
    setCurrentPage(urlPage);
  }, [urlSearch, urlCategoryId, urlCauseId, urlSort, urlPage]);

  // ── Load dropdown options once on mount
  useEffect(() => {
    fetch(`${apiBase}categories`)
      .then(r => r.json())
      .then(data => {
        const items = data?.data?.items ?? [];
        setCategories([ALL_OPTION, ...items.map(c => ({ label: c.name, value: c.id }))]);
      });

    fetch(`${apiBase}causes`)
      .then(r => r.json())
      .then(data => {
        const items = data?.data?.items ?? [];
        setCauses([ALL_OPTION, ...items.map(c => ({ label: `${c.iconEmoji ?? ""} ${c.name}`.trim(), value: c.id }))]);
      });
  }, []);

  // ── Push new filter state into the URL
  const updateURL = useCallback((filters) => {
    const qs = buildURLParams(filters);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, pathname]);

  // ── Fetch campaigns from API
  const fetchCampaigns = useCallback(async (filters) => {
    setLoading(true);
    try {
      const res  = await fetch(`${apiBase}campaigns?${buildAPIParams(filters)}`);
      const json = await res.json();

      setCampaigns(json?.data?.items ?? []);

      const pagination = json?.meta?.pagination;
      setTotalItems(pagination?.total ?? 0);
      setTotalPages(pagination?.pages ?? Math.ceil((pagination?.total ?? 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Re-fetch whenever URL-driven params change
  useEffect(() => {
    fetchCampaigns({ q: urlSearch, categoryId: urlCategoryId, causeId: urlCauseId, sort: urlSort, page: urlPage });
  }, [urlSearch, urlCategoryId, urlCauseId, urlSort, urlPage, fetchCampaigns]);

  // ── Debounced search — resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        setCurrentPage(1);
        updateURL({ q: searchInput, categoryId: activeCategoryId, causeId: activeCauseId, sort: sortBy, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter / sort handlers
  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
    setCurrentPage(1);
    updateURL({ q: searchInput, categoryId, causeId: activeCauseId, sort: sortBy, page: 1 });
  };

  const handleCauseChange = (causeId) => {
    setActiveCauseId(causeId);
    setCurrentPage(1);
    updateURL({ q: searchInput, categoryId: activeCategoryId, causeId, sort: sortBy, page: 1 });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURL({ q: searchInput, categoryId: activeCategoryId, causeId: activeCauseId, sort, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL({ q: searchInput, categoryId: activeCategoryId, causeId: activeCauseId, sort: sortBy, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setActiveCategoryId("");
    setActiveCauseId("");
    setSortBy("new_first");
    setCurrentPage(1);
    router.replace(pathname);
  };

  // ── Derived display values
  const activeCategoryLabel = categories.find(c => c.value === activeCategoryId)?.label ?? "";
  const activeCauseLabel    = causes.find(c => c.value === activeCauseId)?.label ?? "";

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="bg-[#F6F6F6] min-h-screen">

      {/* Hero banner */}
      <div className="bg-[url('/images/bg/cta-bg.png')] bg-cover bg-center bg-no-repeat w-full">
        <div className="max-w-[1611px] mx-auto pt-[140px] pb-[92px] px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-1">
            All Campaigns
          </h1>
          <p className="text-[13px] sm:text-sm text-white mb-6">
            Browse active campaigns and find causes you want to support
          </p>

          {/* Search + Filters + Sort */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search input */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {SearchIcon}
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full bg-[#FFFFFF40] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>

            {/* Category filter */}
            <CustomDropdown
              options={categories}
              value={activeCategoryId}
              onChange={handleCategoryChange}
              label="CAMPAIGN CAUSES"
              icon={FilterIcon}
              showDot={!!activeCategoryId}
              maxHeight="260px"
              width="w-64"
            />

            {/* Cause filter */}
            <CustomDropdown
              options={causes}
              value={activeCauseId}
              onChange={handleCauseChange}
              label="CAUSES"
              icon={FilterIcon}
              showDot={!!activeCauseId}
              maxHeight="260px"
              width="w-64"
            />

            {/* Sort */}
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

      {/* Results area */}
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">

        {/* Result count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            Viewing{" "}
            <span className="font-semibold text-[#383838]">{totalItems}</span>{" "}
            campaign{totalItems !== 1 ? "s" : ""}
            {activeCategoryLabel && activeCategoryLabel !== "All" && (
              <> in <span className="font-semibold text-[#EA3335]">{activeCategoryLabel}</span></>
            )}
            {activeCauseLabel && activeCauseLabel !== "All" && (
              <> · <span className="font-semibold text-[#EA3335]">{activeCauseLabel}</span></>
            )}
            {searchInput && (
              <> matching <span className="font-semibold text-[#383838]">"{searchInput}"</span></>
            )}
          </p>
        </div>

        {/* Campaign grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[520px] animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
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
              className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default CampaignsPage;
