"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CampaignCard from "@/components/common/CampaignCard";
import CustomDropdown from "@/components/common/CustomDropdown";
import Pagination from "@/components/common/Pagination";
import { FilterIcon, SearchIcon } from "@/components/common/SvgIcon";
import { apiBase } from "@/utils/constants";

// ─── Sort options (UI label → API value) ──────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest",      value: "new_first" },
  { label: "Oldest",      value: "old_first" },
  { label: "A → Z",       value: "a_to_z"   },
  { label: "Z → A",       value: "z_to_a"   },
];

const LIMIT = 3; // campaigns per page

// ─── Page ─────────────────────────────────────────────────────────────────────
const CampaignsPage = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Read initial state from URL ──────────────────────────────────────────
  const urlSearch     = searchParams.get("q")          ?? "";
  const urlCategoryId = searchParams.get("categoryId") ?? "";
  const urlSort       = searchParams.get("sort")       ?? "new_first";
  const urlPage       = parseInt(searchParams.get("page") ?? "1", 10);

  // ── Local UI state ───────────────────────────────────────────────────────
  const [searchInput,      setSearchInput]      = useState(urlSearch);
  const [activeCategoryId, setActiveCategoryId] = useState(urlCategoryId);
  const [sortBy,           setSortBy]           = useState(urlSort);
  const [currentPage,      setCurrentPage]      = useState(urlPage);

  // ── Data state ───────────────────────────────────────────────────────────
  const [campaigns,   setCampaigns]   = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [categories,  setCategories]  = useState([{ label: "All", value: "" }]);

  // ── Sync state when browser back/forward ────────────────────────────────
  useEffect(() => {
    setSearchInput(urlSearch);
    setActiveCategoryId(urlCategoryId);
    setSortBy(urlSort);
    setCurrentPage(urlPage);
  }, [urlSearch, urlCategoryId, urlSort, urlPage]);

  // ── Fetch categories once for the dropdown ───────────────────────────────
  // Replace this URL with your real categories endpoint if available.
  // For now we derive unique category names from the campaigns response
  // and store them without IDs (pure name filter won't work with API —
  // wire up a real /categories endpoint and map { id, name } when ready).
  //
  // If your backend exposes GET /api/v1/categories, uncomment and adapt:
  //
  // useEffect(() => {
  //   fetch(`${apiBase}categories`)
  //     .then(r => r.json())
  //     .then(data => {
  //       const opts = [{ label: "All", value: "" },
  //         ...(data?.data?.items ?? []).map(c => ({ label: c.name, value: c.id }))];
  //       setCategories(opts);
  //     });
  // }, []);

  // ── URL writer ───────────────────────────────────────────────────────────
  const updateURL = useCallback((q, catId, sort, page) => {
    const params = new URLSearchParams();
    if (q)                 params.set("q",          q);
    if (catId)             params.set("categoryId",  catId);
    if (sort !== "new_first") params.set("sort",     sort);
    if (page > 1)          params.set("page",        String(page));
    params.set("limit", String(LIMIT));
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, pathname]);

  // ── Fetch campaigns from API ─────────────────────────────────────────────
  const fetchCampaigns = useCallback(async (q, catId, sort, page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  String(page));
      params.set("limit", String(LIMIT));
      if (q)     params.set("q",          q);
      if (catId) params.set("categoryId",  catId);
      if (sort)  params.set("sort",        sort);

      const res  = await fetch(`${apiBase}campaigns?${params.toString()}`);
      const json = await res.json();

      setCampaigns(json?.data?.items ?? []);
      const pagination = json?.meta?.pagination;
      setTotalItems(pagination?.total  ?? 0);
      setTotalPages(pagination?.pages  ?? Math.ceil((pagination?.total ?? 0) / LIMIT));
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Re-fetch whenever URL params change ─────────────────────────────────
  useEffect(() => {
    fetchCampaigns(urlSearch, urlCategoryId, urlSort, urlPage);
  }, [urlSearch, urlCategoryId, urlSort, urlPage, fetchCampaigns]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Debounced search — reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        setCurrentPage(1);
        updateURL(searchInput, activeCategoryId, sortBy, 1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (catId) => {
    setActiveCategoryId(catId);
    setCurrentPage(1);
    updateURL(searchInput, catId, sortBy, 1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
    updateURL(searchInput, activeCategoryId, val, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(searchInput, activeCategoryId, sortBy, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setActiveCategoryId("");
    setSortBy("new_first");
    setCurrentPage(1);
    router.replace(pathname);
  };

  // ── Active category label for display ───────────────────────────────────
  const activeCategoryLabel =
    categories.find((c) => c.value === activeCategoryId)?.label ?? "";

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

            {/* Search */}
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

      {/* ── Results area ────────────────────────────────────────────── */}
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">

        {/* Count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-[#737373]">
            Viewing{" "}
            <span className="font-semibold text-[#383838]">{totalItems}</span>{" "}
            campaign{totalItems !== 1 ? "s" : ""}
            {activeCategoryLabel && activeCategoryLabel !== "All" && (
              <> in <span className="font-semibold text-[#EA3335]">{activeCategoryLabel}</span></>
            )}
            {searchInput && (
              <> matching <span className="font-semibold text-[#383838]">"{searchInput}"</span></>
            )}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[520px] animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>

            {/* Pagination */}
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
              className="mt-5 px-5 py-2.5 bg-[#EA3335] text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
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