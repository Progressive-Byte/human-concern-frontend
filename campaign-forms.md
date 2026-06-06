# Campaign Forms API (Admin)

Mounted under `/api/v1/admin`.

Campaigns are **containers**. All wizard configuration (basics, causes, goals/dates, objectives, add-ons, media) lives on **Campaign Forms**.

Wizard order:
basics → goals & dates → causes → objectives → addons → media → review

| Method | Path                                        | Auth   | Extra authorization          | Body                 | Notes                                             |
| ------ | ------------------------------------------- | ------ | ---------------------------- | -------------------- | ------------------------------------------------- |
| GET    | `/api/v1/admin/campaigns/:campaignId/forms` | Bearer | Requires `campaigns.read`    | -                    | List forms for a campaign                         |
| POST   | `/api/v1/admin/campaigns/:campaignId/forms` | Bearer | Requires `campaigns.write`   | `internal`, `public` | Create a draft form (basics is the first step)    |
| GET    | `/api/v1/admin/forms`                       | Bearer | Requires `campaigns.read`    | -                    | List all forms with filters                       |
| GET    | `/api/v1/admin/forms/:formId`               | Bearer | Requires `campaigns.read`    | -                    | Get full form                                     |
| GET    | `/api/v1/admin/forms/:formId/basics`        | Bearer | Requires `campaigns.read`    | -                    | Get basics section                                |
| PATCH  | `/api/v1/admin/forms/:formId/basics`        | Bearer | Requires `campaigns.write`   | `internal`, `public` | Patch basics section (draft-only)                 |
| GET    | `/api/v1/admin/forms/:formId/goals-dates`   | Bearer | Requires `campaigns.read`    | -                    | Get goals & dates section                         |
| PATCH  | `/api/v1/admin/forms/:formId/goals-dates`   | Bearer | Requires `campaigns.write`   | goals/dates fields   | Patch goals & dates section (draft-only)          |
| GET    | `/api/v1/admin/forms/:formId/causes`        | Bearer | Requires `campaigns.read`    | -                    | Get causes section                                |
| PATCH  | `/api/v1/admin/forms/:formId/causes`        | Bearer | Requires `campaigns.write`   | `causeIds`           | Patch causes section (draft-only)                 |
| GET    | `/api/v1/admin/forms/:formId/objectives`    | Bearer | Requires `campaigns.read`    | -                    | Get objectives section                            |
| PATCH  | `/api/v1/admin/forms/:formId/objectives`    | Bearer | Requires `campaigns.write`   | `objectiveIds?`      | Patch objectives section (draft-only)             |
| GET    | `/api/v1/admin/forms/:formId/addons`        | Bearer | Requires `campaigns.read`    | -                    | Get add-ons section                               |
| PATCH  | `/api/v1/admin/forms/:formId/addons`        | Bearer | Requires `campaigns.write`   | `addOnIds?`          | Patch add-ons section (draft-only)                |
| GET    | `/api/v1/admin/forms/:formId/media`         | Bearer | Requires `campaigns.read`    | -                    | Get media section                                 |
| PATCH  | `/api/v1/admin/forms/:formId/media`         | Bearer | Requires `campaigns.write`   | multipart or JSON    | Patch media section (draft-only)                  |
| GET    | `/api/v1/admin/forms/:formId/review`        | Bearer | Requires `campaigns.read`    | -                    | Review readiness to publish                       |
| POST   | `/api/v1/admin/forms/:formId/publish`       | Bearer | Requires `campaigns.publish` | -                    | Publish form (requires parent campaign published) |
| POST   | `/api/v1/admin/forms/:formId/unpublish`     | Bearer | Requires `campaigns.publish` | -                    | Unpublish form (published-only)                   |
| POST   | `/api/v1/admin/forms/:formId/archive`       | Bearer | Requires `campaigns.write`   | -                    | Archive form                                      |
| POST   | `/api/v1/admin/forms/:formId/restore`       | Bearer | Requires `campaigns.write`   | -                    | Restore form                                      |

## Params

- `campaignId`: Mongo ObjectId
- `formId`: Mongo ObjectId

## `GET /api/v1/admin/forms`

Lists campaign forms across all campaigns.

Query params:

| Field        | Type   | Required | Validation                           | Description                                                                 |
| ------------ | ------ | -------: | ------------------------------------ | --------------------------------------------------------------------------- |
| `page`       | string |       No | integer-like string                  | Page number                                                                 |
| `limit`      | string |       No | integer-like string                  | Page size                                                                   |
| `sort`       | string |       No | -                                    | Sort field (implementation-defined; supports `createdAt`, `name`, `status`) |
| `order`      | enum   |       No | `asc` \| `desc`                      | Sort direction (when using `sort`)                                          |
| `q`          | string |       No | trim                                 | Search by form name, slug, or public display name/description               |
| `status`     | enum   |       No | `draft` \| `published` \| `archived` | Filter by form status                                                       |
| `campaignId` | string |       No | Mongo ObjectId                       | Filter by campaign container id                                             |

Response:

- `data.items[]`: full CampaignForm objects (includes wizard sections such as `basics`, `goalsDates`, `objectives`, `addons`, `media`, `sectionsCompleted`)
- `meta.pagination`: `{ page, limit, total }`

## `POST /api/v1/admin/campaigns/:campaignId/forms`

This creates a new draft form using the **basics** body (same schema as `PATCH /api/v1/admin/forms/:formId/basics`).

Body (strict):

- `internal` (required)
- `public` (required)

## Wizard Bodies (Forms)

Wizard step bodies are the same shapes as before, but they apply to **forms**:

- `PATCH /api/v1/admin/forms/:formId/basics`
- `PATCH /api/v1/admin/forms/:formId/goals-dates`
- `PATCH /api/v1/admin/forms/:formId/causes`
- `PATCH /api/v1/admin/forms/:formId/objectives`
- `PATCH /api/v1/admin/forms/:formId/addons`

### `PATCH /api/v1/admin/forms/:formId/basics`

Body (strict):

| Field                       | Type             | Required | Notes                                                  |
| --------------------------- | ---------------- | -------: | ------------------------------------------------------ |
| `internal.campaignId`       | string           |      Yes | 1–32, regex `^[0-9]+(-[0-9]+)*$`                       |
| `internal.fundCause`        | string           |      Yes | 1–200                                                  |
| `internal.fundCode`         | string \| number |      Yes | 1–64 digits; numbers only; must be unique across forms |
| `internal.beneficiaryId`    | string \| number |      Yes | 1–64 digits; numbers only; must be unique across forms |
| `internal.designation`      | string           |      Yes | 1–64                                                   |
| `internal.shortDescription` | string           |      Yes | free text; max 200                                     |
| `internal.locationId`       | string           |      Yes | 1–100                                                  |
| `public.displayName`        | string           |      Yes | 3–80                                                   |
| `public.description`        | string           |       No | max 500                                                |
| `public.campaignType`       | enum             |      Yes | `seasonal` \| `ongoing`                                |
| `public.categoryIds`        | string\[]        |      Yes | 1–10 unique Mongo ObjectIds                            |
| `public.featured`           | boolean          |       No | -                                                      |
| `public.collaborationOrganizationName`  | string | No | 1–120 |
| `public.collaborationOrganizationImage` | object | No | `{ path, alt? }` where `path` starts with `/uploads/` |

### `PATCH /api/v1/admin/forms/:formId/goals-dates`

Body (strict). `currency` and `startAt` are required for this section to be considered complete.

| Field                     | Type                                                                                                                                            | Required | Notes                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------------------------------------------- |
| `currency`                | string                                                                                                                                          |       No | 3–10                                           |
| `goalAmount`              | number                                                                                                                                          |       No | positive                                       |
| `startAt`                 | string                                                                                                                                          |      Yes | valid date string                              |
| `endAt`                   | string \| null                                                                                                                                  |       No | valid date string; if set: `startAt < endAt`   |
| `minimumDonation`         | number                                                                                                                                          |       No | positive                                       |
| `maximumDonation`         | number                                                                                                                                          |       No | positive; `minimumDonation <= maximumDonation` |
| `allowOneTimeDonations`   | boolean                                                                                                                                         |       No | Default `true`. At least one of `allowOneTimeDonations` or `allowRecurringDonations` must be `true`. |
| `suggestedAmounts`        | `{ id?: string, value: number, description: string, isDefault?: boolean }[]`                                                                    |       No | Only used when `allowOneTimeDonations=true`. If `id` omitted, backend generates one. |
| `customNotes`             | `{ id?: string, type: "input" \| "textarea" \| "select" \| "radio" \| "checkbox", key: string, label: string, required?: boolean, helpText?: string, placeholder?: string, defaultValue?: string \| boolean, options?: { id?: string, label: string, value: string }[] }[]` | No | Dynamic fields collected at checkout. `key` values must be unique. For `select`/`radio`, `options` is required (min 2). If `id` omitted, backend generates one. |
| `allowRecurringDonations` | boolean                                                                                                                                         |       No | -                                              |
| `recurringPresets` | `{ id?: string, name: string, enabled?: boolean, sortOrder?: number, scheduleType: "date_range" \| "specific_dates", scheduleConfig: object }[]` | No | Only used when `allowRecurringDonations=true`. If `id` omitted, backend generates one. If `endAt` is set, preset dates must not exceed `endAt`. |
| `enableTipping`           | boolean                                                                                                                                         |       No | -                                              |
| `allowAnonymousDonations` | boolean                                                                                                                                         |       No | -                                              |
| `showGlobalNote`          | boolean                                                                                                                                         |       No | Default `false`. Show the global note from settings on this form. |

### `PATCH /api/v1/admin/forms/:formId/causes`

Body (strict):

| Field      | Type      | Required | Validation                  |
| ---------- | --------- | -------: | --------------------------- |
| `causeIds` | string\[] |      Yes | unique; each Mongo ObjectId |

### `PATCH /api/v1/admin/forms/:formId/objectives`

Objectives are required to publish **only** when the form has the `ramadan` category selected in `basics.public.categoryIds`.

Body (strict):

| Field          | Type      | Required | Validation              |
| -------------- | --------- | -------: | ----------------------- |
| `objectiveIds` | string\[] |       No | unique; active required |

Response (GET and PATCH):

- `data.objectiveIds`: string\[] (Mongo ObjectIds)
- `data.sectionsCompleted`

### `PATCH /api/v1/admin/forms/:formId/addons`

Body (strict):

| Field      | Type      | Required | Validation              |
| ---------- | --------- | -------: | ----------------------- |
| `addOnIds` | string\[] |       No | unique; active required |

Response (GET and PATCH):

- `data.addOnIds`: string\[] (Mongo ObjectIds)
- `data.sectionsCompleted`

## Media Upload (`PATCH /api/v1/admin/forms/:formId/media`)

Content type: `multipart/form-data`

| Field            | Type    | Required | Notes                                                                                                                                               |
| ---------------- | ------- | -------: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `thumbnailImage` | file    |       No | Saved to `/uploads/forms/*` (max 1MB; jpg/jpeg/png/webp/gif). Required for the section to be considered complete, but not required on every update. |
| `sliderImages`   | file\[] |       No | Up to 10 files. If provided, they are merged with existing slider images (existing images are kept).                                                |
| `thumbnailAlt`   | string  |       No | Optional alt text                                                                                                                                   |
| `videoUrl`       | string  |       No | Must be a valid URL. Empty string clears the value.                                                                                                 |

If content type is JSON, body (strict):

| Field            | Type      | Required | Notes                 |
| ---------------- | --------- | -------: | --------------------- |
| `thumbnailImage` | object    |      Yes | `{ path, alt? }`      |
| `sliderImages`   | object\[] |       No | each `{ path, alt? }` |
| `videoUrl`       | string    |       No | valid URL             |

## Publishing Rules

- A form can be published only if its parent **Campaign** is already `published`.
- Public endpoints only return forms where **both** campaign and form are `published`.

## Review response (`GET /api/v1/admin/forms/:formId/review`)

- `form.basics` returns only: `displayName`, `description`, `campaignType`
- `form.goalsDates` returns only: `currency`, `startAt`, `endAt`, `allowOneTimeDonations`, `allowRecurringDonations`, `enableTipping`, `allowAnonymousDonations`, `showGlobalNote`
- `form.media` is not returned

## Common errors

- `404 CAMPAIGN_NOT_FOUND`
- `404 FORM_NOT_FOUND`
- `409 FUND_CODE_IN_USE`
- `409 BENEFICIARY_ID_IN_USE`
- `400 CAMPAIGN_NOT_PUBLISHED` (publishing a form before the campaign is published)
- `400 FORM_NOT_READY` (review failed)
- `400 FORM_NOT_EDITABLE` (attempted to edit a non-draft form)
- `400 INVALID_STATUS`
- `400 INVALID_DONATION_SETTINGS`
- `400 INVALID_RECURRING_PRESET_DATES`
- `400 INVALID_CUSTOM_NOTES`

## Request Body Examples

### `POST /api/v1/admin/campaigns/:campaignId/forms`

```json
{
  "internal": {
    "campaignId": "123456789012345678901234",
    "fundCause": "Zakat",
    "fundCode": "1001",
    "beneficiaryId": "2001",
    "designation": "General Fund",
    "shortDescription": "Annual zakat collection",
    "locationId": "NYC001"
  },
  "public": {
    "displayName": "Annual Zakat Campaign 2024",
    "description": "Help us collect zakat for those in need",
    "campaignType": "seasonal",
    "categoryIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "featured": true,
    "collaborationOrganizationName": "Partner Org",
    "collaborationOrganizationImage": { "path": "/uploads/forms/partner-org.png", "alt": "Partner organization logo" }
  }
}
```

### `PATCH /api/v1/admin/forms/:formId/basics`

```json
{
  "internal": {
    "campaignId": "123456789012345678901234",
    "fundCause": "Zakat",
    "fundCode": "1001",
    "beneficiaryId": "2001",
    "designation": "General Fund",
    "shortDescription": "Annual zakat collection",
    "locationId": "NYC001"
  },
  "public": {
    "displayName": "Annual Zakat Campaign 2024",
    "description": "Help us collect zakat for those in need",
    "campaignType": "seasonal",
    "categoryIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "featured": true,
    "collaborationOrganizationName": "Partner Org",
    "collaborationOrganizationImage": { "path": "/uploads/forms/partner-org.png", "alt": "Partner organization logo" }
  }
}
```

### `PATCH /api/v1/admin/forms/:formId/goals-dates`

```json
{
  "currency": "USD",
  "goalAmount": 50000,
  "startAt": "2024-01-01T00:00:00.000Z",
  "endAt": "2024-12-31T23:59:59.999Z",
  "minimumDonation": 10,
  "maximumDonation": 10000,
  "allowOneTimeDonations": true,
  "suggestedAmounts": [
    { "id": "amt-25", "value": 25, "description": "Small" },
    { "id": "amt-50", "value": 50, "description": "Medium", "isDefault": true },
    { "id": "amt-100", "value": 100, "description": "Large" }
  ],
  "customNotes": [
    {
      "type": "input",
      "key": "onBehalfOf",
      "label": "Donate on behalf of?",
      "required": false,
      "placeholder": "Full name"
    },
    {
      "type": "checkbox",
      "key": "anonymousDonation",
      "label": "Make this donation anonymous",
      "required": false,
      "defaultValue": false
    },
    {
      "type": "select",
      "key": "tShirtSize",
      "label": "T-shirt size",
      "required": true,
      "options": [
        { "label": "S", "value": "s" },
        { "label": "M", "value": "m" },
        { "label": "L", "value": "l" }
      ]
    }
  ],
  "allowRecurringDonations": true,
  "recurringPresets": [
    {
      "name": "Every week",
      "enabled": true,
      "sortOrder": 10,
      "scheduleType": "date_range",
      "scheduleConfig": {
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-02-01T00:00:00.000Z",
        "frequency": "weekly"
      }
    },
    {
      "name": "Every 5 days",
      "enabled": true,
      "sortOrder": 20,
      "scheduleType": "date_range",
      "scheduleConfig": {
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-02-01T00:00:00.000Z",
        "frequency": "daily",
        "intervalValue": 5
      }
    },
    {
      "name": "Special nights",
      "enabled": true,
      "sortOrder": 30,
      "scheduleType": "specific_dates",
      "scheduleConfig": {
        "dates": ["2024-01-05T00:00:00.000Z", "2024-01-12T00:00:00.000Z"]
      }
    }
  ],
  "enableTipping": false,
  "allowAnonymousDonations": true,
  "showGlobalNote": true
}
```

Notes:
- `recurringPresets[].id` is optional in requests. If omitted, backend generates an id and returns it in the PATCH response.
- `suggestedAmounts[].id` is optional in requests. If omitted, backend generates an id and returns it in the PATCH response.
- At most one `suggestedAmounts[]` item can set `isDefault: true`.

### `PATCH /api/v1/admin/forms/:formId/causes`

```json
{
  "causeIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

### `PATCH /api/v1/admin/forms/:formId/objectives`

```json
{
  "objectiveIds": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"]
}
```

### `PATCH /api/v1/admin/forms/:formId/addons`

```json
{
  "addOnIds": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
}
```

### `PATCH /api/v1/admin/forms/:formId/media` (JSON)

```json
{
  "thumbnailImage": {
    "path": "/uploads/forms/thumbnail_abc123.jpg",
    "alt": "Campaign thumbnail image"
  },
  "sliderImages": [
    {
      "path": "/uploads/forms/slide1_def456.jpg",
      "alt": "First slide image"
    },
    {
      "path": "/uploads/forms/slide2_ghi789.jpg",
      "alt": "Second slide image"
    }
  ],
  "videoUrl": "https://www.youtube.com/watch?v=example"
}
```
