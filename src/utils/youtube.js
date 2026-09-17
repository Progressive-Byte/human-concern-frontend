/** Extracts a YouTube video id from a full URL, a short youtu.be link, or a bare id. */
export function youtubeIdFromUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z0-9_-]{6,20}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return url.pathname.replace(/^\//, "").split("/")[0] || "";
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
    }
  } catch {
    return "";
  }
  return "";
}
