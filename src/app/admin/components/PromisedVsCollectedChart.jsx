function niceCeil(value) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 1;

  const exponent = Math.floor(Math.log10(v));
  const base = Math.pow(10, exponent);

  const steps = [1, 2, 5, 10];
  for (const s of steps) {
    const candidate = s * base;
    if (candidate >= v) return candidate;
  }
  return 10 * base;
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString();
}

export default function PromisedVsCollectedChart({ items = [] }) {
  const rows = Array.isArray(items) ? items : [];
  const maxRaw = rows.reduce((acc, item) => {
    const p = Number(item?.promised || 0);
    const c = Number(item?.collected || 0);
    return Math.max(acc, p, c);
  }, 0);
  const max = niceCeil(maxRaw);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((t) => ({ t, value: Math.round(max * t) }));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Promised vs Collected</h2>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No chart data available
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="grid grid-cols-[48px_1fr] gap-3">
              <div className="relative h-[220px]">
                {ticks.map((tick) => (
                  <div
                    key={tick.t}
                    className="absolute left-0 -translate-y-1/2 text-[11px] text-[#6B7280]"
                    style={{ top: `${(1 - tick.t) * 100}%` }}
                  >
                    {formatNumber(tick.value)}
                  </div>
                ))}
              </div>

              <div className="relative h-[220px]">
                {ticks.map((tick) => (
                  <div
                    key={tick.t}
                    className="absolute left-0 right-0 border-t border-dashed border-[#E5E7EB]"
                    style={{ top: `${(1 - tick.t) * 100}%` }}
                  />
                ))}

                <div className="absolute inset-0 flex items-end justify-between gap-4 px-2">
                  {rows.map((item) => {
                    const promised = Number(item?.promised || 0);
                    const collected = Number(item?.collected || 0);
                    const promisedPct = max ? (promised / max) * 100 : 0;
                    const collectedPct = max ? (collected / max) * 100 : 0;

                    return (
                      <div key={item?.campaignId || item?.campaignName} className="flex w-full flex-col items-center">
                        <div className="flex h-[200px] items-end gap-2">
                          <div
                            className="w-[26px] rounded-t-md bg-[#4B5563]"
                            style={{ height: `${Math.max(0, Math.min(100, promisedPct))}%` }}
                            title={`Committed: ${formatNumber(promised)}`}
                          />
                          <div
                            className="w-[26px] rounded-t-md bg-[#111827]"
                            style={{ height: `${Math.max(0, Math.min(100, collectedPct))}%` }}
                            title={`Collected: ${formatNumber(collected)}`}
                          />
                        </div>
                        <div className="mt-2 max-w-[96px] truncate text-center text-[11px] text-[#6B7280]">
                          {item?.campaignName || "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#4B5563]" />
              <span>Committed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#111827]" />
              <span>Collected</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

