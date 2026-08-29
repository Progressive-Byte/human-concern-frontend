"use client";

function ProviderIcon({ name }) {
  const n = String(name || "").toLowerCase();
  if (n.includes("stripe")) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M13.48 2H21v2.506h-5.022c-.593 0-.942.156-.942.58 0 .265.11.442.582.578l1.16.338c1.52.444 2.64 1.208 2.64 2.827 0 1.93-1.39 2.976-3.33 2.976l-1.432-.01V7.577c0-.78.102-1.29.23-1.544-.19.02-.41.028-.63.028H9.612c-2.23 0-3.81-.968-3.81-2.62 0-1.57 1.307-2.52 3.488-2.52l4.19.06zm-3.24 1.616h-1.1c-1.11 0-1.63.368-1.63 1.01 0 .662.58 1.01 1.72 1.01h1.04V3.616zM21 9.99v2.48H9.608c-.78 0-1.31-.096-1.31-.548 0-.246.094-.437.342-.572l1.19-.364c1.75-.535 2.966-1.285 2.966-2.966 0-1.87-1.32-2.908-3.347-2.908H3v2.52h4.72c.594 0 .89.14.89.572 0 .238-.083.418-.424.543l-1.18.347C5.18 10.163 4 11.017 4 12.707 4 14.61 5.515 15.61 7.692 15.61h4.21v-2.6h-1.086c-1.045 0-1.564-.38-1.564-1.03 0-.642.52-1.01 1.708-1.01h6.11c.277 0 .454.03.454.214V9.99z" />
        </svg>
      </span>
    );
  }
  if (n.includes("paypal")) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#003087]/10 text-[#003087]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 3.98-.42 2.23-1.792 3.32-3.865 3.927-.36.106-.74.195-1.135.266-.854.152-1.885.253-2.744.253-.604 0-1.128-.03-1.582-.083-.578-.078-.847.19-.96.753l-1.59 7.83-.788 4.828zm2.87-16.23h1.804c1.56 0 2.582.21 3.23.66.645.448.967 1.06.875 2.05-.14 1.51-1.28 2.32-3.03 2.32h-1.29l.51-2.536.98-4.9z" />
        </svg>
      </span>
    );
  }
  if (n.includes("square")) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#006AFF]/10 text-[#006AFF]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M2 0h20a2 2 0 012 2v20a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm11.5 6c-3.1 0-4.8 2.1-4.8 5.5 0 3.1 1.8 5.4 4.8 5.4h1.1v-3h-1.1c-1.4 0-2.3-.7-2.3-2.4 0-1.5.7-2.5 2.3-2.5 1.5 0 2.4.9 2.4 2.3V12h3V8.4c0-2.5-1.4-3.9-4.2-3.9h-.2v1.5z" />
        </svg>
      </span>
    );
  }
  if (n.includes("adyen")) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0AB15F]/10 text-[#0AB15F]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M15.002 0c-.523 0-1.025.215-1.379.572L.566 13.869a2.39 2.39 0 000 3.338L6.41 23.055c-.084.02-.17.026-.25.026H1.634A1.628 1.628 0 010 21.456V2.544A2.54 2.54 0 012.544 0h12.458zm6.286 3.195l-7.274 7.642a1.42 1.42 0 000 1.998l7.274 7.593a2.72 2.72 0 01.798 1.964v2.536h1.716A2.144 2.144 0 0024 22.786V1.66A2.144 2.144 0 0021.858-.484H14.3a2.716 2.716 0 00-1.964.796l7.832 7.94a1.42 1.42 0 001.998 0l1.245-1.26a1.42 1.42 0 000-1.998l-2.123-2.138a.484.484 0 00-.68 0zm-2.082 7.347L10.286 2.185a.484.484 0 00-.68 0L7.483 4.323a1.42 1.42 0 000 1.998L12.921 12 7.483 17.68a1.42 1.42 0 000 1.997l2.123 2.138a.484.484 0 00.68 0l8.92-8.357a1.42 1.42 0 000-1.998l-2.122-2.918z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#111827]/10 text-[#111827] font-bold text-[10px]">
      {String(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GatewayHealthFilters = ({ provider, providers = [], sinceMinutes, onChangeProvider, onChangeSinceMinutes }) => {
  const providerList = Array.isArray(providers) ? providers : [];
  const uniqueProviders = Array.from(new Set(["all", ...providerList]));

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-[220px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <select
          value={provider}
          onChange={(e) => onChangeProvider?.(e.target.value)}
          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        >
          {uniqueProviders.map((p) => (
            <option key={p} value={p === "all" ? "" : p}>
              {p === "all" ? "All Providers" : p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full md:w-[220px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <ClockIcon />
          </span>
          <select
            value={String(sinceMinutes || "15")}
            onChange={(e) => onChangeSinceMinutes?.(e.target.value)}
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          >
            <option value="15">Last 15 minutes</option>
            <option value="60">Last 60 minutes</option>
            <option value="360">Last 6 hours</option>
            <option value="1440">Last 24 hours</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export { ProviderIcon };
export default GatewayHealthFilters;
