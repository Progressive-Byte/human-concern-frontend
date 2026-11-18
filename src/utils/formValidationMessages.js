const CODE_MESSAGES = {
  FORM_NOT_EDITABLE: "This form is not editable. Move it to Draft or restore it first.",
  FORM_NOT_FOUND: "This form could not be found. Refresh the page and try again.",
  CAMPAIGN_NOT_FOUND: "This campaign could not be found. Go back and choose a campaign.",
  CAMPAIGN_NOT_PUBLISHED: "Publish the campaign first, then publish this form.",
  FORM_NOT_READY: "Some sections still need attention before publishing.",
  INVALID_CATEGORY: "Some selected categories are no longer available. Refresh and choose again.",
  INVALID_CAUSE: "Some selected causes are no longer available. Refresh and choose again.",
  INVALID_DESIGNATION: "Some selected designations are no longer available. Refresh and choose again.",
  INVALID_OBJECTIVE: "Some selected objectives are no longer available. Refresh and choose again.",
  INVALID_ADD_ON: "Some selected add-ons are no longer available. Refresh and choose again.",
  INVALID_CUSTOM_NOTES: "Check the custom questions below.",
  INVALID_RANGE: "Maximum donation must be greater than the minimum.",
  INVALID_RECURRING_PRESET_DATES: "All recurring preset dates must be inside the campaign dates.",
  INVALID_DONATION_SETTINGS: "Turn on one-time or recurring donations.",
  FUND_CODE_IN_USE: "This cause code is already used. Choose a different one.",
  BENEFICIARY_ID_IN_USE: "This beneficiary ID is already used. Choose a different one.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
};

const EXACT_MESSAGES = {
  Required: "This field is required.",
  Invalid: "Choose a valid option.",
  "Invalid date": "Enter a valid date.",
  "Invalid date format": "Enter a valid date.",
  "Invalid url": "Enter a valid link.",
  "Must be a number": "Enter a number.",
  "Must be greater than 0": "Enter a number greater than 0.",
  "Must be an integer": "Enter a whole number.",
  "Must be unique": "This value is already used.",
  "Min 2": "Use 2 or more.",
  "End date must be after start date": "End date must be after the start date.",
  "End must be after start": "End date must be after the start date.",
  "startAt must be before endAt": "End date must be after the start date.",
  "startDate must be before endDate": "End date must be after the start date.",
  "Must be on or after campaign start date": "Choose a date on or after the campaign start.",
  "Must be on or before campaign end date": "Choose a date on or before the campaign end.",
  "Select at least one day": "Choose at least one weekday.",
  "Add at least one date": "Add at least one date.",
  "All dates must fall within the campaign start and end dates": "All dates must be inside the campaign dates.",
  "Add at least 2 options": "Add at least two choices.",
  "options must contain at least 2 items": "Add at least two choices.",
  "customNotes options must contain at least 2 items": "Add at least two choices.",
  "options values must be unique": "Each choice needs a different value.",
  "customNotes option values must be unique": "Each choice needs a different value.",
  "options is only allowed for select and radio": "Choices are only available for dropdown and multiple-choice questions.",
  "defaultValue must be boolean for checkbox": "For a checkbox, the default must be on or off.",
  "defaultValue must be string": "The default answer must be text.",
  "placeholder is not allowed for checkbox": "A checkbox cannot have placeholder text.",
  "placeholder is only allowed for input and textarea": "Placeholder text is only available for short and long text.",
  "customNotes keys must be unique": "Two custom questions have the same internal key. Change one label or remove the duplicate.",
  "customNotes type is invalid": "Choose a valid answer type.",
  "customNotes option value is required": "Each choice needs a value.",
  "customNotes option label is required": "Each choice needs a label.",
  "key format is invalid": "The question key can only use lowercase letters, numbers, and underscores.",
  "Cause IDs must be unique": "Each cause can only be selected once.",
  "Designation IDs must be unique": "Each designation can only be selected once.",
  "objectiveIds must be unique": "Each objective can only be selected once.",
  "addOnIds must be unique": "Each add-on can only be selected once.",
  "suggestedAmounts values must be unique": "Each suggested amount must be different.",
  "suggestedAmounts ids must be unique": "Two suggested amounts are duplicated. Remove one.",
  "Only one suggested amount can be default": "Choose only one default suggested amount.",
  "recurringPresets ids must be unique": "Two recurring presets are duplicated. Remove one.",
  "Only one recurring preset can be default": "Choose only one default recurring preset.",
  "daysOfWeek is only allowed when frequency is weekly": "Choose weekly before selecting weekdays.",
  "minimumDonation must be less than or equal to maximumDonation": "Maximum donation must be greater than or equal to the minimum.",
  "minimumDonation must be less than maximumDonation": "Maximum donation must be greater than the minimum.",
  "At least one payment type must be enabled": "Turn on one-time or recurring donations.",
  "Recurring preset dates must fall within the campaign start and end dates": "All recurring preset dates must be inside the campaign dates.",
  "Only draft forms can be edited": "This form is read-only. Move it to Draft before editing.",
  "Restore this form before editing it": "Restore this form before editing it.",
  "Publish the campaign before publishing forms": "Publish the campaign first, then publish this form.",
  "Only draft forms can be published": "This form is already published.",
  "Only published forms can be unpublished": "This form is not published.",
  "Form cannot be archived": "This form cannot be archived right now.",
  "Only archived forms can be restored": "Only archived forms can be restored.",
  "Form is not ready to publish": "Some sections still need attention before publishing.",
  "Form name is required": "Enter a form name.",
  "Campaign ID is required": "The form ID is required.",
  "Campaign ID must be at most 32 characters": "Use 32 characters or fewer.",
  "Campaign ID format is invalid": "Use only numbers and dashes, like 1-767.",
  "Display campaign name is required": "Enter a display name.",
  "Display campaign name must be at most 80 characters": "Use 80 characters or fewer.",
  "Short description is required": "Enter a short description.",
  "Short description must be at most 200 characters": "Use 200 characters or fewer.",
  "Description must be at most 5000 characters": "Use 5,000 characters or fewer.",
  "Campaign type is invalid": "Choose a campaign type.",
  "At most 10 categories are allowed": "Choose no more than 10 categories.",
  "Categories must be unique": "Each category can only be selected once.",
  "Start date is required": "Choose a start date.",
  "Start date must be a valid date": "Enter a valid date.",
  "End date must be a valid date": "Enter a valid date.",
  "Form not found": "This form could not be found. Refresh the page and try again.",
  "Campaign not found": "This campaign could not be found. Go back and choose a campaign.",
  "paymentMethods provider is invalid": "Choose valid payment methods.",
  "paymentMethods configurationId is required": "Choose valid payment methods.",
  "paymentMethods name is required": "Choose valid payment methods.",
  "paymentMethods must be unique by provider + configurationId": "Each payment method can only be selected once.",
  "File too large (max 1MB)": "The image must be 1 MB or smaller.",
  "Unexpected file field": "The image could not be uploaded. Please try again.",
  "Invalid form-data payload": "The image could not be uploaded. Please try again.",
  "Image path is required": "The image could not be uploaded. Please try again.",
  "Image path must start with /uploads/": "The image could not be uploaded. Please try again.",
  "One or more selected categories do not exist or are not active": "Some selected categories are no longer available. Refresh and choose again.",
  "One or more selected causes are invalid or archived": "Some selected causes are no longer available. Refresh and choose again.",
  "One or more selected causes no longer exist or are not active": "Some selected causes are no longer available. Refresh and choose again.",
  "One or more selected designations are invalid or archived": "Some selected designations are no longer available. Refresh and choose again.",
  "One or more selected objectives do not exist or are not active": "Some selected objectives are no longer available. Refresh and choose again.",
  "One or more selected objectives no longer exist or are not active": "Some selected objectives are no longer available. Refresh and choose again.",
  "One or more selected add-ons do not exist or are not active": "Some selected add-ons are no longer available. Refresh and choose again.",
  "One or more selected add-ons are invalid or inactive": "Some selected add-ons are no longer available. Refresh and choose again.",
  "One or more selected add-ons no longer exist or are not active": "Some selected add-ons are no longer available. Refresh and choose again.",
  "Complete required campaign details": "Finish the required fields in Basics.",
  "currency and startAt are required": "Choose a currency and a start date.",
  "goalAmount must be > 0 (if provided)": "Goal amount must be greater than 0.",
  "endAt must be after startAt (if provided)": "End date must be after the start date.",
  "Select at least one cause": "Choose at least one cause.",
  "at least one valid objective is required to publish": "Choose at least one objective before publishing.",
  "thumbnailImage is required": "Add a thumbnail image before publishing.",
  "Button label and URL must be set together": "Add both a label and a link, or leave both empty.",
  "URL must be an http(s) link or a site path starting with /": "Enter a full link or a path starting with /.",
  "Could not save your changes.": "We couldn’t save your changes. Please try again.",
  "Failed to fetch": "We couldn’t connect. Check your connection and try again.",
  "Load failed": "We couldn’t connect. Check your connection and try again.",
  "NetworkError when attempting to fetch resource.": "We couldn’t connect. Check your connection and try again.",
  "The operation was aborted.": "The request took too long. Please try again.",
  "Internal Server Error": "Something went wrong. Please try again.",
};

const PREFIXES = [
  "Invalid request body:",
  "Invalid query string:",
  "Invalid route params:",
  "Invalid request:",
];

function stripPrefix(value) {
  let text = value;
  let changed = true;

  while (changed) {
    changed = false;
    for (const prefix of PREFIXES) {
      if (text.toLowerCase().startsWith(prefix.toLowerCase())) {
        text = text.slice(prefix.length).trim();
        changed = true;
      }
    }
  }

  return text;
}

export function humanizeFormError(message) {
  const raw = String(message ?? "").trim();
  if (!raw) return "";

  const text = stripPrefix(raw);

  if (EXACT_MESSAGES[text]) return EXACT_MESSAGES[text];

  const lower = text.toLowerCase();
  const exactKey = Object.keys(EXACT_MESSAGES).find((key) => key.toLowerCase() === lower);
  if (exactKey) return EXACT_MESSAGES[exactKey];

  let match = text.match(/^String must contain at least (\d+) character\(s\)$/i);
  if (match) return `Use at least ${match[1]} characters.`;

  match = text.match(/^String must contain at most (\d+) character\(s\)$/i);
  if (match) return `Use ${match[1]} characters or fewer.`;

  match = text.match(/^Array must contain at most (\d+) element\(s\)$/i);
  if (match) return `Add no more than ${match[1]} items.`;

  match = text.match(/^Array must contain at least (\d+) element\(s\)$/i);
  if (match) return `Add at least ${match[1]} items.`;

  if (/^Number must be greater than 0$/i.test(text)) return "Enter a number greater than 0.";
  if (/^Number must be greater than or equal to 0$/i.test(text)) return "Enter 0 or more.";
  if (text.startsWith("Too small")) return "Enter a value that meets the minimum.";
  if (text.startsWith("Too big")) return "Enter a smaller value.";

  if (text.includes("Mongo ObjectId") || text.includes("ObjectId")) {
    return "One selected item is invalid. Remove it and choose again.";
  }
  if (text.includes("provider + configurationId")) return "Each payment method can only be selected once.";
  if (text.startsWith("Invalid enum value")) return "Choose one of the available options.";
  if (text.startsWith("Invalid literal value")) return "Choose one of the available options.";
  if (text.startsWith("Invalid option")) return "Choose one of the available options.";
  if (text.startsWith("Invalid discriminator value")) return "Choose a valid schedule type.";
  if (text.startsWith("Unrecognized key")) return "Some data could not be saved. Refresh the page and try again.";
  if (text.startsWith("Invalid input")) {
    if (text.includes("expected number")) return "Enter a number.";
    if (text.includes("expected boolean")) return "Choose a valid option.";
    return "Enter a valid value.";
  }
  if (text.startsWith("Invalid url")) return "Enter a valid link.";
  if (text.startsWith("Request failed with status")) return "Something went wrong. Please try again.";

  return text;
}

export function getFormErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const code = String(error?.code || "").trim();
  const rawMessage = typeof error === "string" ? error : error?.message;
  const fromMessage = humanizeFormError(rawMessage || "");

  if (fromMessage && fromMessage !== String(rawMessage || "")) return fromMessage;
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  return fromMessage || fallback;
}
