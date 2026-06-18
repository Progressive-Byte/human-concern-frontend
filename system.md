# System API

Base path: `/api/v1`

### Response envelope

- Success: `{ "data": <any>, "meta"?: <object> }`
- Error: `{ "error": { "code": string, "message": string, "details"?: any }, "requestId": string }`

### Request IDs

- You can send `x-request-id` (8–64 chars, `[a-zA-Z0-9_-]`) and the server will echo it back.
- If omitted/invalid, the server generates one and returns it in `x-request-id` and in error responses.

### Content types

- JSON: `Content-Type: application/json`
- Form-data without files is also accepted globally (`multipart/form-data`).
- File uploads are supported via specific endpoints (for example campaign media) using `multipart/form-data`, storing files under `/uploads/*`.

### Rate limiting

Rate-limited requests return HTTP `429`:

```json
{
  "error": { "code": "RATE_LIMITED", "message": "Too Many Requests" },
  "requestId": "..."
}
```

Rate limit headers are enabled (standard headers).

### Authentication

- Protected admin endpoints require `Authorization: Bearer <accessToken>`.
- `POST /api/v1/auth/change-password` requires `Authorization: Bearer <accessToken>`.

Authorization is handled via headers only. Do not send access tokens in the request body.

Header format:

```
Authorization: Bearer <accessToken>
```

***

### System Endpoints

| Method | Path             | Auth   | Body | Notes                                             |
| ------ | ---------------- | ------ | ---- | ------------------------------------------------- |
| GET    | `/api/v1/`       | Public | -    | `{ data: { status: "ok" } }`                      |
| GET    | `/api/v1/health` | Public | -    | Basic liveness check                              |
| GET    | `/api/v1/ready`  | Public | -    | Returns `503 NOT_READY` if Mongo is not connected |
