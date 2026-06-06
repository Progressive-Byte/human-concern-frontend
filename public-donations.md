# Public Donations API

Mounted at `/api/v1/donations`.

| Method | Path                       | Auth                                | Body | Notes                                         |
| ------ | -------------------------- | ----------------------------------- | ---- | --------------------------------------------- |
| POST   | `/api/v1/donations/submit` | Public (optional user bearer token) | JSON | Submit checkout donation (guest or logged-in) |

## `POST /api/v1/donations/submit`

### Auth behavior

- No `Authorization` header: guest checkout path.
- Valid user access token: authenticated checkout path.
- Malformed/invalid `Authorization` header/token: `401 UNAUTHORIZED`.

### Request body
Example (one-time payment):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "one_time",
    "amount": 50,
    "currency": "USD",
    "platformTipAmount": 2
  },
  "addons": {
    "items": [
      {
        "addOnId": "507f1f77bcf86cd799439013",
        "values": { "persons": 1 }
      }
    ]
  }
}
```

Example (one-time payment - anonymous):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "isAnonymous": true,
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "one_time",
    "amount": 50,
    "currency": "USD"
  }
}
```

Example (split payment - date_range with daily frequency):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "split",
    "amount": 100,
    "currency": "USD",
    "scheduleType": "date_range",
    "scheduleConfig": {
      "startDate": "2030-01-10T00:00:00.000Z",
      "endDate": "2030-01-30T00:00:00.000Z",
      "frequency": "daily",
      "dates": [
        { "date": "2030-01-10T00:00:00.000Z", "amount": 10 },
        { "date": "2030-01-11T00:00:00.000Z", "amount": 10 },
        { "date": "2030-01-12T00:00:00.000Z", "amount": 10 }
      ]
    }
  }
}
```

Example (split payment - date_range with weekly frequency):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "split",
    "amount": 100,
    "currency": "USD",
    "scheduleType": "date_range",
    "scheduleConfig": {
      "startDate": "2030-01-10T00:00:00.000Z",
      "endDate": "2030-02-10T00:00:00.000Z",
      "frequency": "weekly",
      "dates": [
        { "date": "2030-01-10T00:00:00.000Z", "amount": 25 },
        { "date": "2030-01-17T00:00:00.000Z", "amount": 25 },
        { "date": "2030-01-24T00:00:00.000Z", "amount": 25 },
        { "date": "2030-01-31T00:00:00.000Z", "amount": 25 }
      ]
    }
  }
}
```

Example (split payment - date_range with monthly frequency):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "split",
    "amount": 100,
    "currency": "USD",
    "scheduleType": "date_range",
    "scheduleConfig": {
      "startDate": "2030-01-10T00:00:00.000Z",
      "endDate": "2030-04-10T00:00:00.000Z",
      "frequency": "monthly",
      "dates": [
        { "date": "2030-01-10T00:00:00.000Z", "amount": 25 },
        { "date": "2030-02-10T00:00:00.000Z", "amount": 25 },
        { "date": "2030-03-10T00:00:00.000Z", "amount": 25 },
        { "date": "2030-04-10T00:00:00.000Z", "amount": 25 }
      ]
    }
  }
}
```

Example (split payment - date_range with yearly frequency):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "split",
    "amount": 100,
    "currency": "USD",
    "scheduleType": "date_range",
    "scheduleConfig": {
      "startDate": "2030-01-10T00:00:00.000Z",
      "endDate": "2032-01-10T00:00:00.000Z",
      "frequency": "yearly",
      "dates": [
        { "date": "2030-01-10T00:00:00.000Z", "amount": 50 },
        { "date": "2031-01-10T00:00:00.000Z", "amount": 50 }
      ]
    }
  }
}
```

Example (split payment - date_range with interval frequency):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "split",
    "amount": 100,
    "currency": "USD",
    "scheduleType": "date_range",
    "scheduleConfig": {
      "startDate": "2030-01-10T00:00:00.000Z",
      "endDate": "2030-02-10T00:00:00.000Z",
      "frequency": "interval",
      "intervalValue": 10,
      "dates": [
        { "date": "2030-01-10T00:00:00.000Z", "amount": 33.33 },
        { "date": "2030-01-20T00:00:00.000Z", "amount": 33.33 },
        { "date": "2030-01-30T00:00:00.000Z", "amount": 33.34 }
      ]
    }
  }
}
```

Example (with customNotes and onBehalfOf):

```json
{
  "formId": "507f1f77bcf86cd799439010",
  "info": {
    "organization": "Acme Foundation",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1000",
    "addressLine1": "22 Baker Street",
    "city": "Houston",
    "postalCode": "77001",
    "state": "Texas",
    "streetName": "Baker Street",
    "country": "USA"
  },
  "causeIds": ["507f1f77bcf86cd799439011"],
  "onBehalfOf": "In memory of Ahmed Khan",
  "customNotes": {
    "prayerRequest": "Please pray for my family",
    "anonymousDonation": true
  },
  "paymentMethod": "stripe",
  "payment": {
    "paymentMode": "one_time",
    "amount": 50,
    "currency": "USD"
  }
}
```

Notes:

- `formId` is required.
- Use either `causeId` (single cause, backward compatible) or `causeIds` (multiple causes). Do not provide both.
- `onBehalfOf` (optional): separate free-text field (trimmed, max 120). Stored separately from `customNotes`.
- `customNotes` (optional): key/value map of donor answers. Validated against the form’s `goalsDates.customNotes` (unknown keys rejected; required fields enforced).
- `isAnonymous` (optional, default `false`):
  - When `true`, `info` is required (even if authenticated) and `info.email` is required.
  - When `true` and authenticated, `info.email` must match the logged-in user email.
- `paymentMethod` is required. Supported: `stripe`, `paypal`.
- `paymentDetails` is not accepted by this endpoint.

### Schedule variants

Supported `payment.scheduleType` values:

- `specific_dates`:
  - `{ "dates": [{ "date": "2030-01-01T00:00:00.000Z", "amount": 50 }, { "date": "2030-01-10T00:00:00.000Z", "amount": 75 }] }`
- `date_range`:
  - `frequency`: `daily | weekly | monthly | yearly | interval`
  - if `frequency === "interval"` then include `intervalValue` (days)
  - must include `dates: [{ date, amount }]` and the backend validates it matches the generated schedule

End date rule:
- If the selected form has an `endAt` date, then for `specific_dates` and `date_range` schedules the last scheduled date must be `<= endAt`.
- If the form has no `endAt`, no end-date validation is applied.

### Response

Split donation response (Stripe SetupIntent, Donation is created on webhook):

```json
{
  "data": {
    "campaignId": "507f1f77bcf86cd799439010",
    "formId": "507f1f77bcf86cd799439020",
    "formSlug": "campaign-1",
    "currency": "USD",
    "paymentMode": "split",
    "pendingSessionId": "507f1f77bcf86cd799439099",
    "payment": {
      "provider": "stripe",
      "setupIntentId": "seti_123",
      "clientSecret": "seti_123_secret_456"
    },
    "message": "Donation submitted successfully"
  }
}
```

Notes:

- `campaignId` in the response is derived from the form’s parent campaign.
- `formSlug` in the response is always the resolved form slug.
- `stripe`: `payment.clientSecret` should be used by the client to complete payment.
- `paypal`: `payment.orderId` should be used by the client to complete payment (PayPal checkout flow).

### Validation and business errors

- `404 FORM_NOT_FOUND`
- `400 INVALID_CAUSE_SELECTION`
- `400 INVALID_ADD_ON_SELECTION`
- `400 INVALID_DONATION_AMOUNT`
- `400 PAYMENT_METHOD_NOT_SUPPORTED`
- `400 PAYMENT_METHOD_NOT_SUPPORTED_FOR_SPLIT`
- `400 RECURRING_NOT_ALLOWED`
- `400 ANONYMOUS_EMAIL_MISMATCH`
- `400 CUSTOM_NOTES_INVALID`
- `400 CUSTOM_NOTES_REQUIRED`
- `400 CUSTOM_NOTES_UNKNOWN_KEY`
- `400 VALIDATION_ERROR` (schedule contract mismatch, invalid ids, missing fields, invalid dates)
- `401 UNAUTHORIZED` (invalid optional token)
- `500 SETTINGS_ENCRYPTION_KEY_MISSING`
- `500 PAYMENT_GATEWAY_NOT_CONFIGURED`
- `502 PAYMENT_GATEWAY_ERROR`
