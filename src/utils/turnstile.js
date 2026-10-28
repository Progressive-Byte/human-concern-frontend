/*
  Cloudflare Turnstile: the bot check in front of the donate and track forms.

  The script is fetched once per page. Each form draws its own widget, and the widget answers with
  a short token. The API checks that token before it takes a donation or sends a link.
*/

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_SITE_KEY = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

/* Empty key (local work) leaves the widget out and the API lets the form through. */
export const TURNSTILE_ENABLED = TURNSTILE_SITE_KEY.length > 0;

let scriptPromise = null;

export function loadTurnstile() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.turnstile) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${SRC}"]`);

      if (existing) {
        existing.addEventListener("load", () => resolve(Boolean(window.turnstile)));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(Boolean(window.turnstile));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export function renderTurnstile(container, handlers = {}) {
  if (!window.turnstile) return null;

  try {
    return window.turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      size: handlers.size || "flexible",
      callback: (token) => handlers.onToken?.(token),
      "expired-callback": () => handlers.onExpire?.(),
      "error-callback": () => handlers.onError?.(),
    });
  } catch {
    return null;
  }
}

export function resetTurnstile(widgetId) {
  if (!widgetId || !window.turnstile) return;

  try {
    window.turnstile.reset(widgetId);
  } catch {
    // The widget may already be gone; a reset is never worth failing the page for.
  }
}

export function removeTurnstile(widgetId) {
  if (!widgetId || !window.turnstile) return;

  try {
    window.turnstile.remove(widgetId);
  } catch {
    // ignore
  }
}
