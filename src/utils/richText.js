const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "CODE",
  "PRE",
  "H3",
  "H4",
  "DIV",
  "SPAN",
  "A",
]);

const DROP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "FORM",
  "INPUT",
  "BUTTON",
  "TEXTAREA",
  "SELECT",
  "LINK",
  "META",
]);

/* Text only. Used where HTML does not belong, such as a card preview or a title. */
export function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h3|h4|blockquote|pre)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/*
  Keeps only the tags the description editor can make. Everything else is removed, and so is
  every attribute except a safe link. The result is safe to place in the page.
*/
export function sanitizeHtml(value) {
  const html = String(value || "");

  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*\/?>/gi, "")
      .replace(/<\s*\/?\s*(?!(?:p|br|b|strong|i|em|u|s|ul|ol|li|blockquote|code|pre|h3|h4|div|span|a)\b)[a-z0-9-]+[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\shref\s*=\s*("|')\s*(javascript|data):[^"']*\1/gi, "");
  }

  const doc = new DOMParser().parseFromString(`<div id="rich-root">${html}</div>`, "text/html");
  const root = doc.getElementById("rich-root");
  if (!root) return "";

  for (const node of Array.from(root.querySelectorAll("*"))) {
    const tag = node.tagName.toUpperCase();

    if (DROP_TAGS.has(tag)) {
      node.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...node.childNodes);
      continue;
    }

    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (tag === "A" && name === "href" && /^(https?:|mailto:|tel:|\/|#)/.test(value)) {
        continue;
      }

      node.removeAttribute(attr.name);
    }
  }

  return root.innerHTML;
}
