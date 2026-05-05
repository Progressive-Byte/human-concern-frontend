"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CampaignCard from "@/app/(site)/campaigns/components/CampaignCard";
import CustomDropdown from "@/components/common/CustomDropdown";
import Pagination from "@/components/common/Pagination";
import { FilterIcon, SearchIcon } from "@/components/common/SvgIcon";
import { serverApiBase } from "@/utils/constants";

const SORT_OPTIONS = [
  { label: "Newest", value: "new_first" },
  { label: "Oldest", value: "old_first" },
  { label: "A → Z",  value: "a_to_z"   },
  { label: "Z → A",  value: "z_to_a"   },
];

const ALL_OPTION          = { label: "All", value: "" };
const PAGE_SIZE           = 10;
const FILTER_FETCH_LIMIT  = 500;

function buildAPIParams({ q, sort, page, limit }) {
  const p = new URLSearchParams();
  p.set("page",  String(page));
  p.set("limit", String(limit ?? PAGE_SIZE));
  if (q)    p.set("q",    q);
  if (sort) p.set("sort", sort);
  return p.toString();
}

function buildURLParams({ q, category, cause, sort, page }) {
  const p = new URLSearchParams();
  if (q)                    p.set("q",        q);
  if (category)             p.set("category", category);
  if (cause)                p.set("cause",    cause);
  if (sort !== "new_first") p.set("sort",     sort);
  if (page > 1)             p.set("page",     String(page));
  return p.toString();
}

const CampaignsPageInner = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const urlSearch   = searchParams.get("q")        ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlCause    = searchParams.get("cause")    ?? "";
  const urlSort     = searchParams.get("sort")     ?? "new_first";
  const urlPage     = parseInt(searchParams.get("page") ?? "1", 10);

  const [searchInput,    setSearchInput]    = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeCause,    setActiveCause]    = useState(urlCause);
  const [sortBy,         setSortBy]         = useState(urlSort);
  const [currentPage,    setCurrentPage]    = useState(urlPage);

  const [campaigns,    setCampaigns]    = useState([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [categories,   setCategories]   = useState([ALL_OPTION]);
  const [causes,       setCauses]       = useState([ALL_OPTION]);
  const [filtersReady, setFiltersReady] = useState(false);

  // key → name maps used for client-side campaign filtering
  const categoryMap = useRef({});  // { "education": "Education", ... }
  const causeMap    = useRef({});  // { "general-donation": "General Donation", ... }

  // Sync local state when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(urlSearch);
    setActiveCategory(urlCategory);
    setActiveCause(urlCause);
    setSortBy(urlSort);
    setCurrentPage(urlPage);
  }, [urlSearch, urlCategory, urlCause, urlSort, urlPage]);

  // Load categories and causes in parallel; populate lookup maps for client-side filtering
  useEffect(() => {
    Promise.all([
      fetch(`${serverApiBase}categories`).then(r => r.json()),
      fetch(`${serverApiBase}causes`).then(r => r.json()),
    ]).then(([catData, causeData]) => {
      const catItems = catData?.data?.items ?? [];
      categoryMap.current = Object.fromEntries(catItems.map(c => [c.key, c.name]));
      setCategories([ALL_OPTION, ...catItems.map(c => ({ label: c.name, value: c.key }))]);

      const causeItems = causeData?.data?.items ?? [];
      causeMap.current = Object.fromEntries(causeItems.map(c => [c.slug, c.name]));
      setCauses([ALL_OPTION, ...causeItems.map(c => ({ label: c.name, value: c.slug }))]);

      setFiltersReady(true);
    });
  }, []);

  const updateURL = useCallback((filters) => {
    const qs = buildURLParams(filters);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, pathname]);

  // Campaigns are fetched from the API without category/cause params (the API filter returns
  // empty because campaigns store category names as strings, not ID references). Filtering by
  // category/cause is applied client-side after fetching a large page.
  const fetchCampaigns = useCallback(async ({ q, category, cause, sort, page }) => {
    setLoading(true);
    try {
      const hasFilter = !!(category || cause);
      const limit     = hasFilter ? FILTER_FETCH_LIMIT : PAGE_SIZE;
      const apiPage   = hasFilter ? 1 : page;

      const res  = await fetch(`${serverApiBase}campaigns?${buildAPIParams({ q, sort, page: apiPage, limit })}`);
      const json = await res.json();
      let items  = json?.data?.items ?? [];

      if (hasFilter) {
        // category key → match against campaign.categories (array of name strings)
        if (category && categoryMap.current[category]) {
          const catName = categoryMap.current[category];
          items = items.filter(c =>
            c.categories?.some(n => n.toLowerCase() === catName.toLowerCase())
          );
        }

        // cause slug → match against campaign.causeSlug / cause if present
        if (cause) {
          items = items.filter(c => c.causeSlug === cause || c.cause === cause);
        }

        const total = items.length;
        const start = (page - 1) * PAGE_SIZE;
        setCampaigns(items.slice(start, start + PAGE_SIZE));
        setTotalItems(total);
        setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
      } else {
        const pagination = json?.meta?.pagination;
        setCampaigns(items);
        setTotalItems(pagination?.total ?? 0);
        setTotalPages(pagination?.pages ?? Math.ceil((pagination?.total ?? 0) / PAGE_SIZE));
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Wait for lookup maps before fetching when a category/cause filter is in the URL
  useEffect(() => {
    if ((urlCategory || urlCause) && !filtersReady) return;
    fetchCampaigns({ q: urlSearch, category: urlCategory, cause: urlCause, sort: urlSort, page: urlPage });
  }, [urlSearch, urlCategory, urlCause, urlSort, urlPage, fetchCampaigns, filtersReady]);

  // Debounced search — resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        setCurrentPage(1);
        updateURL({ q: searchInput, category: activeCategory, cause: activeCause, sort: sortBy, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
    updateURL({ q: searchInput, category, cause: activeCause, sort: sortBy, page: 1 });
  };

  const handleCauseChange = (cause) => {
    setActiveCause(cause);
    setCurrentPage(1);
    updateURL({ q: searchInput, category: activeCategory, cause, sort: sortBy, page: 1 });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURL({ q: searchInput, category: activeCategory, cause: activeCause, sort, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL({ q: searchInput, category: activeCategory, cause: activeCause, sort: sortBy, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setActiveCategory("");
    setActiveCause("");
    setSortBy("new_first");
    setCurrentPage(1);
    router.replace(pathname);
  };

  const activeCategoryLabel = categories.find(c => c.value === activeCategory)?.label ?? "";
  const activeCauseLabel    = causes.find(c => c.value === activeCause)?.label ?? "";

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

            {/* Category filter — value is the category key (e.g. "education") */}
            <CustomDropdown
              options={categories}
              value={activeCategory}
              onChange={handleCategoryChange}
              label="CAMPAIGN CAUSES"
              icon={FilterIcon}
              showDot={!!activeCategory}
              maxHeight="260px"
              width="w-64"
            />

            {/* Cause filter — value is the cause slug (e.g. "general-donation") */}
            <CustomDropdown
              options={causes}
              value={activeCause}
              onChange={handleCauseChange}
              label="CAUSES"
              icon={FilterIcon}
              showDot={!!activeCause}
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
              <> matching <span className="font-semibold text-[#383838]">&quot;{searchInput}&quot;</span></>
            )}
          </p>
        </div>

        {/* Campaign grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 my-10 lg:my-[57px] md:my-[30px]">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[520px] animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 my-10 lg:my-[57px] md:my-[30px]">
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

// ─── Page with Suspense boundary

const CampaignsPage = () => {
  return (
    <Suspense fallback={<div className="bg-[#F6F6F6] min-h-screen" />}>
      <CampaignsPageInner />
    </Suspense>
  );
};

export default CampaignsPage;
