# Settings API

Mounted at `/api/v1/admin/settings`.

| Method | Path                                                  | Auth   | Extra authorization   | Body | Notes |
| ------ | ----------------------------------------------------- | ------ | --------------------- | ---- | ----- |
| GET    | `/api/v1/admin/settings/general`                      | Bearer | Requires `settings.read`  | - | Get general + localization settings |
| PATCH  | `/api/v1/admin/settings/general`                      | Bearer | Requires `settings.write` | `...` | Update general + localization settings |
| GET    | `/api/v1/admin/settings/notifications`                | Bearer | Requires `settings.read`  | - | Get notification settings |
| PATCH  | `/api/v1/admin/settings/notifications`                | Bearer | Requires `settings.write` | `...` | Update notification settings |
| GET    | `/api/v1/admin/settings/security`                     | Bearer | Requires `settings.read`  | - | Get security settings |
| PATCH  | `/api/v1/admin/settings/security`                     | Bearer | Requires `settings.write` | `...` | Update security settings |
| GET    | `/api/v1/admin/settings/branding`                     | Bearer | Requires `settings.read`  | - | Get branding settings |
| PATCH  | `/api/v1/admin/settings/branding`                     | Bearer | Requires `settings.write` | `...` | Update branding settings |
| POST   | `/api/v1/admin/settings/branding/logo`                | Bearer | Requires `settings.write` | multipart | Upload branding logo |
| DELETE | `/api/v1/admin/settings/branding/logo`                | Bearer | Requires `settings.write` | - | Remove branding logo |
| GET    | `/api/v1/admin/settings/payment`                      | Bearer | Requires `settings.read`  | - | Get payment gateway status |
| PUT    | `/api/v1/admin/settings/payment/gateways/:provider/configuration` | Bearer | Requires `settings.write` | `...` | Set gateway configuration |
| PATCH  | `/api/v1/admin/settings/payment/gateways/:provider/enabled`       | Bearer | Requires `settings.write` | `enabled` | Enable/disable gateway |
| POST   | `/api/v1/admin/settings/payment/gateways/:provider/disconnect`    | Bearer | Requires `settings.write` | - | Disconnect (disable + clear) |

## General

`PATCH /api/v1/admin/settings/general` body (strict: unknown keys rejected)

At least one field is required in `organization` or `localization`.

| Field                           | Type   | Required | Validation                              | Description              | Example |
| ------------------------------ | ------ | -------: | --------------------------------------- | ------------------------ | ------- |
| `organization.organizationName`| string |       No | trim, min 1, max 200                    | Organization name        | `"Donation Org"` |
| `organization.taxId`           | string |       No | trim, max 100                           | Tax ID                   | `"12-3456789"` |
| `organization.address`         | string |       No | trim, max 500                           | Address                  | `"123 Main St"` |
| `organization.phone`           | string |       No | trim, max 50                            | Phone                    | `"+1 555 000 0000"` |
| `organization.contactEmail`    | string |       No | trim, email                             | Contact email            | `"support@example.com"` |
| `organization.timezone`        | string |       No | trim, min 1, max 100                    | IANA timezone            | `"America/New_York"` |
| `organization.tipLabel`        | string |       No | trim, min 1, max 80                     | Tip label                | `"Platform Support Fees"` |
| `organization.tipDescription`  | string |       No | trim, max 300                           | Tip description          | `"Voluntary support for platform maintenance"` |
| `organization.globalNote`      | array  |       No | max 30 items, keys must be unique       | Global custom notes      | `[{"type":"input","key":"note","label":"Note","required":false}]` |
| `localization.defaultLanguage` | array  |       No | max 30 items, keys must be unique       | Default language custom notes | `[{"type":"input","key":"lang","label":"Language","required":false}]` |
| `localization.defaultCurrency` | string |       No | trim, `^[A-Z]{3}$`                      | Default currency code    | `"USD"` |

## Notifications

`PATCH /api/v1/admin/settings/notifications` body (strict: unknown keys rejected)

At least one field is required.

| Field                 | Type    | Required | Validation | Description | Example |
| --------------------- | ------- | -------: | ---------- | ----------- | ------- |
| `emailEnabled`        | boolean |       No | -          | Enable email notifications | `true` |
| `newDonationReceived` | boolean |       No | -          | New donation notification  | `true` |
| `campaignGoalReached` | boolean |       No | -          | Goal reached notification  | `true` |
| `newDonorRegistration`| boolean |       No | -          | New donor notification     | `true` |
| `failedTransaction`   | boolean |       No | -          | Failed transaction         | `true` |
| `weeklySummaryReport` | boolean |       No | -          | Weekly summary report      | `false` |

## Security

`PATCH /api/v1/admin/settings/security` body (strict: unknown keys rejected)

At least one field is required.

| Field                   | Type    | Required | Validation          | Description | Example |
| ----------------------- | ------- | -------: | ------------------- | ----------- | ------- |
| `twoFactorEnabled`      | boolean |       No | -                   | Enable 2FA | `false` |
| `sessionTimeoutMinutes` | number  |       No | int, min 5, max 1440 | Session timeout | `30` |

## Branding

`PATCH /api/v1/admin/settings/branding` body (strict: unknown keys rejected)

At least one field is required.

| Field          | Type   | Required | Validation                       | Description | Example |
| -------------- | ------ | -------: | -------------------------------- | ----------- | ------- |
| `primaryColor` | string |       No | hex `#rgb` or `#rrggbb`          | Primary UI color | `"#0ea5e9"` |
| `accentColor`  | string |       No | hex `#rgb` or `#rrggbb`          | Accent UI color  | `"#22c55e"` |
| `customCss`    | string |       No | max 50,000                       | Custom CSS | `"body{...}"` |

### Branding Logo Upload

`POST /api/v1/admin/settings/branding/logo` body

Content type: `multipart/form-data`

- field: `file` (required)
- max size: 2MB
- allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg` (image MIME types)

Response is the same shape as `GET /api/v1/admin/settings/branding`, where `branding.logo.path` points to `/uploads/branding/*`.

### Branding Logo Delete

`DELETE /api/v1/admin/settings/branding/logo` clears the logo and returns the same shape as `GET /branding`.

## Payment

`GET /api/v1/admin/settings/payment` returns:

- `gateways`: an array of gateway summaries. Secrets are never returned; only masked last4 values may appear when configured.

### Provider

`provider` path param:

- `stripe`
- `paypal`
- `bank_transfer`

### Configure Gateway

`PUT /api/v1/admin/settings/payment/gateways/:provider/configuration` body (strict: unknown keys rejected)

The body must match the provider.

**Stripe**

| Field        | Type   | Required | Validation        | Example |
| ------------ | ------ | -------: | ----------------- | ------- |
| `apiKey`     | string |      Yes | trim, min 1, max 500 | `"pk_live_..."` |
| `secretKey`  | string |      Yes | trim, min 1, max 500 | `"sk_live_..."` |
| `webhookUrl` | string |      Yes | url, max 2000        | `"https://example.com/webhook"` |
| `webhookSigningSecret` | string | No | trim, min 1, max 500 | `"whsec_..."` |

**PayPal**

| Field          | Type   | Required | Validation          | Example |
| -------------- | ------ | -------: | ------------------- | ------- |
| `clientId`     | string |      Yes | trim, min 1, max 500 | `"Abcd..."` |
| `clientSecret` | string |      Yes | trim, min 1, max 500 | `"XyZ..."` |
| `webhookId`    | string |       No | trim, min 1, max 500 | `"9AB12345CD6789012"` |

**Bank Transfer**

| Field          | Type   | Required | Validation            | Example |
| -------------- | ------ | -------: | --------------------- | ------- |
| `instructions` | string |      Yes | trim, min 1, max 50,000 | `"Please transfer to ..."` |

### Enable / Disable

`PATCH /api/v1/admin/settings/payment/gateways/:provider/enabled` body (strict: unknown keys rejected)

| Field     | Type    | Required | Validation | Description | Example |
| --------- | ------- | -------: | ---------- | ----------- | ------- |
| `enabled` | boolean |      Yes | -          | New enabled state | `true` |

Note: enabling a gateway requires it to be configured; otherwise the API returns `400 GATEWAY_NOT_CONFIGURED`.

### Disconnect

`POST /api/v1/admin/settings/payment/gateways/:provider/disconnect` disables the gateway and clears stored configuration.
