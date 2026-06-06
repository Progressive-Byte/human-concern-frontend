# Public Settings API

Frontend-safe platform settings.

## `GET /api/v1/payment/settings`

Returns frontend-safe payment settings. This endpoint never returns provider secrets (Stripe secret key, webhook signing secret, PayPal client secret).

### Response

```json
{
  "data": {
    "localization": {
      "defaultLanguage": [],
      "defaultCurrency": "USD"
    },
    "gateways": {
      "stripe": {
        "provider": "stripe",
        "enabled": true,
        "configured": true,
        "publishableKey": "pk_test_1234"
      },
      "paypal": {
        "provider": "paypal",
        "enabled": false,
        "configured": false,
        "clientId": ""
      },
      "bankTransfer": {
        "provider": "bank_transfer",
        "enabled": false,
        "configured": false,
        "instructions": ""
      }
    },
    "tips": {
      "label": "Platform Support Fees",
      "description": "Voluntary support for organization fees for platform maintenance and well being"
    },
    "globalNote": [],
    "updatedAt": "2026-05-03T00:00:00.000Z"
  }
}
```

## `GET /api/v1/settings/branding`

Returns frontend-safe branding settings.

### Response

```json
{
  "data": {
    "branding": {
      "logo": { "path": "/uploads/branding/logo.svg" }
    },
    "updatedAt": "2026-05-03T00:00:00.000Z"
  }
}
```
