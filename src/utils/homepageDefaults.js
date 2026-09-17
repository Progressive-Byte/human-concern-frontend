import { siteUrl } from "@/utils/constants";

// Landing-page CMS defaults — the JS mirror of the backend's `defaultHomepageDoc()`.
// The public site renders these whenever a field is empty or the API is unavailable, so the page
// never breaks and always shows today's content.
export const HOMEPAGE_DEFAULTS = {
  sections: {
    hero: {
      enabled: true,
      title: "Give with",
      titleAccent: "Purpose. Transform lives.",
      subtitle: "Your trusted platform for Zakat, Sadaqah, and humanitarian giving.",
      primaryButton: { label: "All campaigns", href: "/campaigns" },
      secondaryButton: { label: "Get started", href: "/user/register" },
      backgroundImage: { path: "/images/hero.png", alt: "" },
      trustBadges: ["Secure Payments", "100% Zakat Compliant", "Tax Deductible"],
      videoUrl: "https://www.youtube.com/watch?v=tX0eDRmropU",
    },
    stats: {
      enabled: true,
      items: [
        { value: "$2.4M+", label: "In Aids Delivered", icon: "aid" },
        { value: "15K+", label: "Active Donors", icon: "donor" },
        { value: "48+", label: "Countries Reached", icon: "country" },
        { value: "250K+", label: "Lives Impacted", icon: "impact" },
      ],
    },
    featured: {
      enabled: true,
      title: "Featured Campaigns",
      subtitle: "Support causes that matter. Every donation makes a difference.",
      ctaLabel: "View All Campaigns",
      ctaHref: "/campaigns",
    },
    sharedLove: {
      enabled: true,
      eyebrow: "Our Global Impact",
      title: "#Sharedlove",
      images: Array.from({ length: 9 }, (_, i) => ({ path: `/images/love-${i + 1}.png`, alt: "" })),
    },
    howItWorks: {
      enabled: true,
      title: "How It Works",
      subtitle: "Simple, secure, and transparent donation process",
      backgroundImage: { path: "/images/bg/how-it-works.png", alt: "" },
      steps: [
        {
          eyebrow: "Sign up &",
          title: "Choose Your Cause",
          description:
            "Select from Zakat, Sadaqah, emergency relief, or specific campaigns that align with your giving goals.",
          image: { path: "/images/cause-card.png", alt: "" },
        },
        {
          eyebrow: "Sign up or Login to",
          title: "Donate Securely",
          description:
            "Make one-time or recurring donations with secure payment processing. Set up automated giving schedules.",
          image: { path: "/images/security-card.png", alt: "" },
        },
        {
          eyebrow: "Login and",
          title: "Track Your Impact",
          description:
            "Monitor your giving history, see where your donations go, and understand the real impact you're making.",
          image: { path: "/images/impact-card.png", alt: "" },
        },
      ],
    },
    waysToGive: {
      enabled: true,
      title: "Ways to Give",
      subtitle: "Multiple donation types to fulfill your religious obligations and charitable aspirations.",
      cards: [
        { title: "Zakat", description: "Obligatory charity for eligible Muslims. Pay your Zakat to purify your wealth.", image: { path: "/images/zakat.png", alt: "Zakat" } },
        { title: "Sadaqah", description: "Voluntary charity that can be given at any time to aid those in need.", image: { path: "/images/sadaqah.png", alt: "Sadaqah" } },
        { title: "Emergency Relief", description: "Rapid responses and aid to disaster areas to help communities recover.", image: { path: "/images/relief.png", alt: "Emergency Relief" } },
        { title: "Water Aid", description: "Build sustainable wells and systems to provide clean, safe water for entire villages.", image: { path: "/images/water-aid.png", alt: "Water Aid" } },
        { title: "Food Aid", description: "Deliver life-saving meals and nutrition packs to families facing hunger and crisis.", image: { path: "/images/food-aid.png", alt: "Food Aid" } },
        { title: "Child Sponsorship", description: "Provide education, healthcare, and daily essentials to transform an orphan's life.", image: { path: "/images/child-sponsorship.png", alt: "Child Sponsorship" } },
      ],
    },
    ctaBanner: {
      enabled: true,
      title: "Ready to Make a Difference?",
      description: "Join thousands of donors who trust Human Concern USA to deliver their contributions to those in need.",
      primaryButton: { label: "Donate Now", href: "/campaigns" },
      secondaryButton: { label: "Get started", href: "/user/register" },
      backgroundImage: { path: "/images/bg/cta-bg.png", alt: "" },
    },
  },
  header: {
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "Track Your Donation", href: "/track-donation" },
    ],
    noticeBar: {
      enabled: true,
      backgroundImage: { path: "/images/topbarNotice.png", alt: "" },
      chips: [
        { label: "Ramadan Food Campaign 2026", href: "" },
        { label: "Iftar & Sohoor Campaign 2026", href: "" },
      ],
    },
  },
  footer: {
    mission: "Fighting poverty for over 40 years.\nHUMAN CONCERN USA is a\n501(C)3\nTax Exempt Nonprofit.",
    contact: {
      email: "info@humanconcernusa.org",
      phone: "1-800-583-5841",
      address: "600 E Carmel Drive Suite 147 Carmel, IN 46032",
      taxId: "92-2388570",
    },
    socials: [
      { label: "WhatsApp", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "YouTube", href: "#" },
    ],
    newsletter: { title: "", subtitle: "", buttonLabel: "Subscribe" },
    copyrightName: "HC USA",
  },
};

/**
 * Merges stored content over the defaults.
 * - Objects merge key by key.
 * - Arrays replace (so removing rows really removes them), but each element merges against the
 *   default element at the same index so a cleared string falls back to the built-in text.
 * - Empty/blank strings fall back to the default; booleans (e.g. `enabled`) are always respected.
 */
export function mergeHomepage(base, patch) {
  if (patch === undefined || patch === null) return base;

  if (typeof patch === "string") {
    return patch.trim() ? patch : (typeof base === "string" ? base : patch);
  }

  if (Array.isArray(patch)) {
    const baseArr = Array.isArray(base) ? base : [];
    return patch.map((item, i) => mergeHomepage(baseArr[i], item));
  }

  if (typeof patch === "object") {
    const out = { ...(base && typeof base === "object" && !Array.isArray(base) ? base : {}) };
    for (const [k, v] of Object.entries(patch)) out[k] = mergeHomepage(out[k], v);
    return out;
  }

  return patch;
}

export function resolveHomepageContent(raw) {
  return mergeHomepage(HOMEPAGE_DEFAULTS, raw && typeof raw === "object" ? raw : {});
}

/**
 * Overlays translated CMS strings onto the resolved homepage content. Keys are the field paths
 * (`homepage.sections.hero.title`); anything without a translation keeps the English source.
 */
export function applyHomepageTranslations(content, strings) {
  const map = strings && typeof strings === "object" ? strings : {};
  const walk = (node, path) => {
    if (typeof node === "string") {
      const key = `homepage.${path}`;
      const value = map[key];
      return typeof value === "string" && value.trim() ? value : node;
    }
    if (Array.isArray(node)) return node.map((item, i) => walk(item, `${path}.${i}`));
    if (node && typeof node === "object") {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v, path ? `${path}.${k}` : k);
      return out;
    }
    return node;
  };
  return walk(content, "");
}

/**
 * Resolves a stored image path (or a bundled default) to a browsable src.
 * Bundled `/images/...` files live on the frontend; uploaded `/uploads/...` files are served by
 * the API, so they get the `siteUrl` prefix.
 */
export function resolveHomepageImage(image, fallbackPath = "") {
  const path = String(image?.path || "").trim() || fallbackPath;
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `${siteUrl}${path}`;
  return path;
}
