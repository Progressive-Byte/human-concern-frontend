// English source strings for the public website (donation pages excluded).
//
// Mirrors `human-concern-api/src/modules/settings/service/translationMessages.js` — add a string in
// both places so the admin "Translate" job includes it. Homepage/CMS copy is NOT listed here: it is
// translated from the live Settings.homepage content instead (keys are `homepage.<path>`).
export const UI_MESSAGES = {
  "nav.home": "Home",
  "nav.campaigns": "Campaigns",
  "nav.trackDonation": "Track Your Donation",
  "nav.dashboard": "Dashboard",
  "nav.logOut": "Log out",
  "nav.signIn": "Sign In",
  "nav.donate": "Donate",
  "nav.hello": "Hello, {name} !",
  "nav.language": "Language",

  "footer.contactUs": "Contact Us",
  "footer.emailPlaceholder": "Enter your email",
  "footer.subscribe": "Subscribe",
  "footer.copyright": "Copyright © {year} {name}. All rights reserved.",
  "footer.taxIdPrefix": "Tax Exempt ID:",

  "campaigns.title": "All Campaigns",
  "campaigns.searchPlaceholder": "Search campaigns...",
  "campaigns.categoryLabel": "CAMPAIGN CATEGORY",
  "campaigns.causesLabel": "CAMPAIGN CAUSES",
  "campaigns.sortLabel": "SORT BY",
  "campaigns.sort.newest": "Newest",
  "campaigns.sort.oldest": "Oldest",
  "campaigns.sort.aToZ": "A → Z",
  "campaigns.sort.zToA": "Z → A",
  "campaigns.all": "All",
  "campaigns.viewing": "Viewing {count} campaigns",
  "campaigns.empty": "No campaigns found",
  "campaigns.clearFilters": "Clear All",

  "track.title": "Track Your Donation",
  "track.verifying": "Verifying your link…",
  "track.invalidLink": "This link is invalid or has expired.",
  "track.couldNotOpen": "We couldn't open that link",
  "track.requestNew": "Request a new link",

  "auth.login.title": "Nice to see you again",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.rememberMe": "Remember me",
  "auth.forgotPassword": "Forgot password?",
  "auth.signIn": "Sign in",
  "auth.signingIn": "Signing in…",
  "auth.orSignInWithGoogle": "Or sign in with Google",
  "auth.noAccount": "Don't have an account?",
  "auth.signUpNow": "Sign up now",
};

/** English fallback for a key (used when a translation is missing). */
export function getMessage(key, fallback) {
  const value = UI_MESSAGES[key];
  if (typeof value === "string") return value;
  return fallback !== undefined ? fallback : key;
}
