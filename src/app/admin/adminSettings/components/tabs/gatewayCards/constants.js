"use client";

export const PROVIDERS = ["stripe", "paypal", "bank_transfer"];

export const CURRENCY_LIST = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", symbol: "ر.س" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", symbol: "Fr" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", symbol: "S$" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", symbol: "NZ$" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", symbol: "₩" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", symbol: "RM" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", symbol: "₱" },
  { code: "VND", name: "Vietnamese Dong", flag: "🇻🇳", symbol: "₫" },
  { code: "BND", name: "Brunei Dollar", flag: "🇧🇳", symbol: "B$" },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", flag: "🇧🇭", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", flag: "🇴🇲", symbol: "ر.ع." },
  { code: "QAR", name: "Qatari Riyal", flag: "🇶🇦", symbol: "ر.ق" },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", symbol: "ج.م" },
  { code: "JOD", name: "Jordanian Dinar", flag: "🇯🇴", symbol: "د.ا" },
  { code: "LBP", name: "Lebanese Pound", flag: "🇱🇧", symbol: "ل.ل" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", symbol: "₺" },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰", symbol: "රු" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴", symbol: "kr" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", flag: "🇵🇱", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", flag: "🇨🇿", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", flag: "🇭🇺", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", flag: "🇷🇴", symbol: "lei" },
  { code: "BGN", name: "Bulgarian Lev", flag: "🇧🇬", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", flag: "🇭🇷", symbol: "kn" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", symbol: "₽" },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "🇺🇦", symbol: "₴" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", symbol: "GH₵" },
  { code: "ETB", name: "Ethiopian Birr", flag: "🇪🇹", symbol: "Br" },
  { code: "MAD", name: "Moroccan Dirham", flag: "🇲🇦", symbol: "د.م." },
  { code: "TND", name: "Tunisian Dinar", flag: "🇹🇳", symbol: "د.ت" },
  { code: "DZD", name: "Algerian Dinar", flag: "🇩🇿", symbol: "د.ج" },
];

export const COUNTRY_LIST = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
];

export function getProviderLabel(provider) {
  const p = String(provider || "").toLowerCase();
  if (p === "bank_transfer") return "Bank Transfer";
  return p ? p[0].toUpperCase() + p.slice(1) : "Provider";
}

export function getProviderIcon(provider) {
  const p = String(provider || "").toLowerCase();
  if (p === "stripe") return "⚡";
  if (p === "paypal") return "🅿️";
  if (p === "bank_transfer") return "🏦";
  return "💳";
}

export function getConfigId(config) {
  return String(config?.configurationId || config?.id || config?._id || "").trim();
}

export function shortId(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  if (input.length <= 8) return input;
  return `${input.slice(0, 4)}...${input.slice(-4)}`;
}

export function getEnvironment(config) {
  const env = String(config?.environment || "").toLowerCase();
  if (env === "live" || env === "test") return env;
  const sk = String(
    config?.secretKey || config?.clientSecret || config?.apiKey || config?.clientId || ""
  ).toLowerCase();
  if (sk.startsWith("sk_live_") || sk.startsWith("pk_live_") || sk.includes("_live_")) return "live";
  if (sk.startsWith("sk_test_") || sk.startsWith("pk_test_") || sk.includes("_test_")) return "test";
  return env || "test";
}

export function inferEnvironmentFromSecrets(form) {
  const sk = String(form?.secretKey || form?.clientSecret || form?.apiKey || form?.clientId || "").toLowerCase();
  if (sk.startsWith("sk_live_") || sk.startsWith("pk_live_") || sk.includes("_live_")) return "live";
  if (sk.startsWith("sk_test_") || sk.startsWith("pk_test_") || sk.includes("_test_")) return "test";
  return null;
}

export function getCurrencyInfo(code) {
  return CURRENCY_LIST.find((c) => c.code === String(code || "").toUpperCase());
}

export const REGION_LIST = [
  { code: "NA", name: "North America", flag: "🌎" },
  { code: "US-only", name: "United States Only", flag: "🇺🇸" },
  { code: "CA-only", name: "Canada Only", flag: "🇨🇦" },
  { code: "LATAM", name: "Latin America", flag: "🌎" },
  { code: "BR-only", name: "Brazil Only", flag: "🇧🇷" },
  { code: "MX-only", name: "Mexico Only", flag: "🇲🇽" },
  { code: "EU", name: "European Union", flag: "🇪🇺" },
  { code: "EEA", name: "European Economic Area", flag: "🇪🇺" },
  { code: "UK-only", name: "United Kingdom Only", flag: "🇬🇧" },
  { code: "CH-only", name: "Switzerland Only", flag: "🇨🇭" },
  { code: "NO-only", name: "Norway Only", flag: "🇳🇴" },
  { code: "MENA", name: "Middle East & North Africa", flag: "🌍" },
  { code: "GCC", name: "Gulf Cooperation Council", flag: "🏜️" },
  { code: "APAC", name: "Asia-Pacific", flag: "🌏" },
  { code: "AU-only", name: "Australia Only", flag: "🇦🇺" },
  { code: "NZ-only", name: "New Zealand Only", flag: "🇳🇿" },
  { code: "JP-only", name: "Japan Only", flag: "🇯🇵" },
  { code: "SG-only", name: "Singapore Only", flag: "🇸🇬" },
  { code: "IN-only", name: "India Only", flag: "🇮🇳" },
  { code: "SEA", name: "Southeast Asia", flag: "🌏" },
  { code: "AFRICA", name: "Sub-Saharan Africa", flag: "🌍" },
  { code: "ZA-only", name: "South Africa Only", flag: "🇿🇦" },
  { code: "NG-only", name: "Nigeria Only", flag: "🇳🇬" },
  { code: "KE-only", name: "Kenya Only", flag: "🇰🇪" },
];

export function getCountryInfo(code) {
  return COUNTRY_LIST.find((c) => c.code === String(code || "").toUpperCase());
}

export function getRegionInfo(code) {
  return REGION_LIST.find((r) => r.code === String(code || ""));
}

export function bpsToPercent(bps) {
  const n = Number(bps) || 0;
  return (n / 100).toFixed(2);
}
