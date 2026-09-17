export const DEFAULT_UNAVAILABLE_PAGE = {
  title: "Campaign currently unavailable",
  description: "This campaign is not currently accepting donations.",
  primaryButton: { label: "Go to Homepage", url: "/" },
  secondaryButton: { label: "View Other Campaigns", url: "/campaigns" },
};

function normalizeButton(button) {
  const label = String(button?.label || "").trim();
  const url = String(button?.url || "").trim();
  if (!label) return null;
  return { label, url };
}

/**
 * Merges a form's stored unavailable-page config with the built-in defaults.
 *
 * - Nothing configured (or an unknown slug) → the full default page.
 * - Partially configured → respect what the admin saved; a button left empty is hidden,
 *   and blank title/description fall back to the default copy so the page never looks broken.
 */
export function resolveUnavailablePage(config) {
  const c = config && typeof config === "object" ? config : {};

  const title = String(c.title || "").trim();
  const description = String(c.description || "").trim();
  const primaryButton = normalizeButton(c.primaryButton);
  const secondaryButton = normalizeButton(c.secondaryButton);

  const isEmpty = !title && !description && !primaryButton && !secondaryButton;
  if (isEmpty) return DEFAULT_UNAVAILABLE_PAGE;

  return {
    title: title || DEFAULT_UNAVAILABLE_PAGE.title,
    description: description || DEFAULT_UNAVAILABLE_PAGE.description,
    primaryButton,
    secondaryButton,
  };
}
