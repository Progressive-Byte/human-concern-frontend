"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import {
  getAdminExportEntities,
  createAdminExportJob,
  getAdminExportJobs,
  downloadAdminExport,
  deleteAdminExport,
} from "@/services/admin";

function useHasPermission(perm) {
  try {
    const ctx = useAdminAuth();
    const admin = ctx?.admin;
    if (!admin) return true;
    const role = String(admin?.role || "").toLowerCase();
    if (role === "super_admin" || role === "super-admin" || role === "admin" || role === "owner") return true;
    const perms = Array.isArray(admin?.permissions) ? admin.permissions : [];
    if (perms.length === 0) return true;
    const required = String(perm || "").toLowerCase();
    const prefix = required.split(".")[0];
    return perms.some((x) => {
      const p = String(x || "").toLowerCase();
      return p === required || p === `${prefix}.*` || p === "*";
    });
  } catch {
    return true;
  }
}

function normalizeObj(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : {};
}

const FORMATS = [
  { value: "csv", label: "CSV", hint: "One section per table" },
  { value: "xlsx", label: "Excel (.xlsx)", hint: "One sheet per table" },
  { value: "pdf", label: "PDF", hint: "Landscape, first 12 columns" },
];

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

const STATUS_TONES = {
  queued: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-500/10 text-red-600",
};

const DataExportPageClient = () => {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const canExport = useHasPermission("data.export");

  const [entities, setEntities] = useState([]);
  const [selection, setSelection] = useState({});
  const [format, setFormat] = useState("csv");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    try {
      const res = await getAdminExportJobs({ limit: 50 });
      const data = normalizeObj(res);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (e) {
      setError(e?.message || "Failed to load exports.");
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [entRes] = await Promise.all([getAdminExportEntities(), loadJobs()]);
        if (!alive) return;
        const data = normalizeObj(entRes);
        setEntities(Array.isArray(data.entities) ? data.entities : []);
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load export tables.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadJobs]);

  // Poll while something is still running.
  const hasPending = useMemo(() => jobs.some((j) => j.status === "queued" || j.status === "processing"), [jobs]);
  useEffect(() => {
    if (!hasPending) return undefined;
    const id = setInterval(() => {
      loadJobs().catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [hasPending, loadJobs]);

  const selectedTables = useMemo(
    () => Object.entries(selection).filter(([, cols]) => Array.isArray(cols) && cols.length),
    [selection],
  );

  function toggleTable(entity) {
    setSelection((prev) => {
      const next = { ...prev };
      if (Array.isArray(next[entity.key]) && next[entity.key].length) {
        delete next[entity.key];
      } else {
        next[entity.key] = entity.defaultColumns && entity.defaultColumns.length
          ? [...entity.defaultColumns]
          : entity.columns.slice(0, 5).map((c) => c.key);
        setExpanded((e) => ({ ...e, [entity.key]: true }));
      }
      return next;
    });
  }

  function toggleColumn(entity, columnKey) {
    setSelection((prev) => {
      const current = Array.isArray(prev[entity.key]) ? prev[entity.key] : [];
      const nextCols = current.includes(columnKey)
        ? current.filter((c) => c !== columnKey)
        : [...current, columnKey];
      const next = { ...prev };
      if (nextCols.length) next[entity.key] = nextCols;
      else delete next[entity.key];
      return next;
    });
  }

  function setAllColumns(entity, mode) {
    setSelection((prev) => ({
      ...prev,
      [entity.key]: mode === "all" ? entity.columns.map((c) => c.key) : [...(entity.defaultColumns || [])],
    }));
  }

  async function handleExport() {
    if (!selectedTables.length) {
      toast.error("Select at least one table and column");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await createAdminExportJob({
        format,
        tables: selectedTables.map(([key, columns]) => ({ key, columns })),
      });
      toast.success("Export queued — it will appear below when ready");
      await loadJobs();
    } catch (e) {
      setError(e?.message || "Could not queue the export.");
      toast.error(e?.message || "Could not queue the export.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDownload(job) {
    setDownloadingId(job.id);
    try {
      await downloadAdminExport(job.id);
    } catch (e) {
      toast.error(e?.message || "Download failed");
    } finally {
      setDownloadingId("");
    }
  }

  async function handleDelete(job) {
    if (!window.confirm("Delete this export? Its file is removed from the server.")) return;
    setDeletingId(job.id);
    try {
      await deleteAdminExport(job.id);
      toast.success("Export deleted");
      await loadJobs();
    } catch (e) {
      toast.error(e?.message || "Could not delete the export.");
    } finally {
      setDeletingId("");
    }
  }

  if (!canExport) {
    return (
      <main className="min-w-0 space-y-6 p-4 md:p-6">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-amber-800">You do not have the `data.export` permission to access this area.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827]">Data Export</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Choose tables and columns, then export as CSV, Excel or PDF. Exports run in the background.
          </p>
        </div>
        <AdminHeaderActions admin={admin} />
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Tables + columns */}
        <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
          <div className="text-[16px] font-semibold text-[#111827]">1. Tables &amp; columns</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">
            Only business data is available. Sensitive fields are never listed.
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-[#6B7280]">Loading…</div>
          ) : (
            <div className="mt-4 space-y-2">
              {entities.map((entity) => {
                const cols = selection[entity.key];
                const isSelected = Array.isArray(cols) && cols.length > 0;
                const open = expanded[entity.key];
                return (
                  <div key={entity.key} className="rounded-xl border border-[#F3F4F6]">
                    <div className="flex flex-wrap items-center gap-3 p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTable(entity)}
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: "#EA3335" }}
                      />
                      <span className="text-[13px] font-semibold text-[#111827]">{entity.label}</span>
                      {isSelected ? (
                        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                          {cols.length} column{cols.length !== 1 ? "s" : ""}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [entity.key]: !e[entity.key] }))}
                        className="ml-auto cursor-pointer text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"
                      >
                        {open ? "Hide columns" : "Columns"}
                      </button>
                    </div>

                    {open ? (
                      <div className="border-t border-[#F3F4F6] p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => setAllColumns(entity, "defaults")} className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
                            Defaults
                          </button>
                          <button type="button" onClick={() => setAllColumns(entity, "all")} className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
                            Select all
                          </button>
                          <button type="button" onClick={() => { setSelection((p) => { const n = { ...p }; delete n[entity.key]; return n; }); }} className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                            Clear
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
                          {entity.columns.map((col) => (
                            <label key={col.key} className="flex items-center gap-2 text-[12px] text-[#383838]">
                              <input
                                type="checkbox"
                                checked={Array.isArray(cols) && cols.includes(col.key)}
                                onChange={() => toggleColumn(entity, col.key)}
                                className="h-3.5 w-3.5 cursor-pointer"
                                style={{ accentColor: "#EA3335" }}
                              />
                              {col.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Format + export */}
        <section className="h-max rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
          <div className="text-[16px] font-semibold text-[#111827]">2. Format</div>
          <div className="mt-3 space-y-2">
            {FORMATS.map((f) => (
              <label key={f.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${format === f.value ? "border-[#EA3335]" : "border-[#E5E7EB]"}`}>
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === f.value}
                  onChange={() => setFormat(f.value)}
                  className="mt-0.5 h-4 w-4"
                  style={{ accentColor: "#EA3335" }}
                />
                <span>
                  <span className="block text-[13px] font-semibold text-[#111827]">{f.label}</span>
                  <span className="block text-[11px] text-[#6B7280]">{f.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-[#F9FAFB] p-3 text-[12px] text-[#6B7280]">
            {selectedTables.length
              ? `${selectedTables.length} table${selectedTables.length !== 1 ? "s" : ""} selected`
              : "No tables selected yet"}
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={creating || !selectedTables.length}
            className="mt-4 w-full rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {creating ? "Queuing…" : "Export"}
          </button>
        </section>
      </div>

      {/* Jobs */}
      <section className="overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-[16px] font-semibold text-[#111827]">Exports</div>
          {hasPending ? <span className="text-[12px] text-[#6B7280]">Waiting for the export worker…</span> : null}
        </div>
        <div className="border-t border-[#F3F4F6]" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px] text-[#111827]">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Created</th>
                <th className="py-3 pr-4">Admin</th>
                <th className="py-3 pr-4">Tables</th>
                <th className="py-3 pr-4">Format</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#6B7280]">No exports yet.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-[#F3F4F6]">
                    <td className="px-5 py-4 text-[#6B7280]">{formatWhen(job.createdAt)}</td>
                    <td className="py-4 pr-4">{job.adminEmail || "—"}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(job.tables || []).map((t) => (
                          <span key={t.key} className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                            {t.label} · {t.rowCount || 0}{t.truncated ? " (capped)" : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 uppercase">{job.format}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_TONES[job.status] || "bg-[#F3F4F6] text-[#6B7280]"}`}>
                        {job.status}
                      </span>
                      {job.error ? <div className="mt-1 text-[11px] text-red-600">{job.error}</div> : null}
                    </td>
                    <td className="py-4 pr-4 text-[#6B7280]">{formatBytes(job.fileSize)}</td>
                    <td className="py-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.downloadable ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(job)}
                            disabled={downloadingId === job.id}
                            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
                          >
                            {downloadingId === job.id ? "Downloading…" : "Download"}
                          </button>
                        ) : (
                          <span className="text-[12px] text-[#9CA3AF]">{job.expired ? "Expired" : "—"}</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          disabled={
                            deletingId === job.id ||
                            job.status === "queued" ||
                            job.status === "processing"
                          }
                          title={
                            job.status === "queued" || job.status === "processing"
                              ? "This export is still running — you can delete it once it finishes"
                              : "Delete this export"
                          }
                          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === job.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default DataExportPageClient;
