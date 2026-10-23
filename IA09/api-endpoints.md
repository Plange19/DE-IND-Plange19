# FlowVantage Backend API Endpoints (Suggested)

## Base URL
- Local: `http://localhost:3000`
- Prefix: `/api/v1`

## Interactive docs
Full OpenAPI/Swagger documentation for every implemented endpoint (request/response
schemas, auth requirements, "try it out") is served at `/api-docs` (raw spec at
`/api-docs.json`) once the server is running. This file stays as a lighter-weight,
human-readable summary; `/api-docs` is the source of truth for exact request/response
shapes.

## Implemented now

### Health
- `GET /health`
  - Purpose: service readiness check.

### Audit logs
- `GET /api/v1/audit-logs`
  - Purpose: list the caller's own audit-trail entries (login/logout/2FA/password/record changes), newest first.
  - Header: `Authorization: Bearer <sessionToken>`
  - Query: `limit` (1–200, default 50), `offset` (default 0), `resourceType` (optional filter).

### Authentication
- `POST /api/v1/auth/signup`
  - Purpose: verify a Firebase ID token from the frontend (after Firebase `createUserWithEmailAndPassword`), upsert the user into Postgres, provision their personal workspace, and issue a backend session token.
  - Body: `{ "idToken": "<firebase-id-token>" }`
- `POST /api/v1/auth/login`
  - Purpose: same as signup, for returning users (after Firebase `signInWithEmailAndPassword`).
  - Body: `{ "idToken": "<firebase-id-token>" }`
- `POST /api/v1/auth/logout`
  - Purpose: ends the caller's session. Sessions are stateless JWTs, so this confirms the token is valid and instructs the client to discard it; there is nothing to revoke server-side.
  - Header: Send the backend session JWT in the `Authorization` header.
- `POST /api/v1/auth/forgot-password`
  - Purpose: trigger password-reset flow via Firebase (and SMTP if configured).
  - Body: `{ "email": "user@example.com" }`
- `GET /api/v1/auth/me`
  - Purpose: fetch currently authenticated session user.
  - Header: Send the backend session JWT in the `Authorization` header.

### Calendar
- `GET /api/v1/calendar`
  - Purpose: list the signed-in user's local calendar events.
- `POST /api/v1/calendar`
  - Purpose: create a local event and best-effort push it to Google Calendar when connected.
  - Body: `{ "title": "Planning", "startTime": "2026-09-16T10:00:00.000Z", "endTime": "2026-09-16T11:00:00.000Z", "description?": "", "location?": "", "projectId?": "" }`
- `PATCH /api/v1/calendar/:id`
  - Purpose: partially update a local event and best-effort push the update to Google.
- `DELETE /api/v1/calendar/:id`
  - Purpose: remove a local event and best-effort remove its mapped Google event.
- `POST /api/v1/calendar/sync`
  - Purpose: pull incremental changes from Google Calendar into local events. This is manually/interval triggered until a public HTTPS webhook endpoint is available.
- `GET /api/v1/calendar/google/connect`
  - Purpose: return the Google OAuth consent URL for the signed-in user.
- `GET /api/v1/calendar/google/callback`
  - Purpose: OAuth redirect target; exchanges the code and redirects the browser to the frontend integrations page.
- `GET /api/v1/calendar/google/status`
  - Purpose: return `{ "connected": boolean }` for the signed-in user.
- `POST /api/v1/calendar/google/disconnect`
  - Purpose: delete the signed-in user's stored Google Calendar credentials.

All calendar endpoints except the Google callback require a backend session JWT in the `Authorization` header.

### Projects
- `POST /api/v1/projects`
  - Purpose: create a project owned by the signed-in user.
  - Body: `{ "name": "Website Revamp", "description?": "", "client?": "", "status?": "Planned", "startDate?": "2026-01-01", "endDate?": "2026-03-01", "tags?": ["design"] }`

### Contacts
- `POST /api/v1/contacts`
  - Purpose: create a contact owned by the signed-in user. Rejects a likely duplicate (matching email, phone, or first+last name) with `409` unless `allow_duplicate: true` is sent.
  - Body: `{ "first_name": "Ada", "last_name?": "", "email?": "", "phone?": "", "company?": "", "allow_duplicate?": false }`
- `GET /api/v1/contacts`
  - Purpose: list the caller's contacts.
- `GET /api/v1/contacts/:id`
  - Purpose: get one of the caller's contacts.
- `PUT /api/v1/contacts/:id`
  - Purpose: update one of the caller's contacts.
- `DELETE /api/v1/contacts/:id`
  - Purpose: delete one of the caller's contacts.
- `POST /api/v1/contacts/merge`
  - Purpose: consolidate a duplicate contact into a primary one (fields blank on the primary are filled from the secondary; the secondary is deleted).
  - Body: `{ "primary_contact_id": "...", "secondary_contact_id": "..." }`

All contacts endpoints require a backend session JWT in the `Authorization` header, and only operate on contacts owned by the caller.

### Notes
- `GET /api/v1/notes`
  - Purpose: list notes the caller can see (their own, plus notes on projects they're a member of).
- `POST /api/v1/notes`
  - Purpose: create a note, optionally attached to a project or contact.
  - Body: `{ "title?": "", "content": "...", "projectId?": "", "contactId?": "" }`
- `GET /api/v1/notes/:id`
  - Purpose: get a note the caller can see.
- `PATCH /api/v1/notes/:id`
  - Purpose: update a note's title/content.
- `DELETE /api/v1/notes/:id`
  - Purpose: delete a note.

All notes endpoints require a backend session JWT in the `Authorization` header.

## Scaffolded only (not implemented yet)
- `ALL /api/v1/dashboard`
- `ALL /api/v1/emails`
- `ALL /api/v1/ai-assistant`
- `ALL /api/v1/documents`
- `ALL /api/v1/inventory`
- `ALL /api/v1/reporting`
- `ALL /api/v1/integrations`

## Future endpoint map (for implementation phases)

### Email
- `POST /api/v1/emails/outlook/connect`
- `GET /api/v1/emails`
- `GET /api/v1/emails/search`
- `GET /api/v1/emails/:threadId`

### AI Assistant
- `POST /api/v1/ai-assistant/meeting-summary`
- `POST /api/v1/ai-assistant/reminders`
- `POST /api/v1/ai-assistant/follow-up-tasks`
- `GET /api/v1/ai-assistant/search`



### POST /api/contacts/import - Contact CSV Import (RICHARD RHULE  - IA08)
**Auth:** Bearer ADMIN/MANAGER
**Headers:** 
- X-Request-Id: UUID v4 (required for idempotency)
- Authorization: Bearer <token>

**Body:** multipart/form-data
- teamId: string (team_plange19_001)
- file: CSV file (must have email header, max 5MB)

**Responses:**
- 201 Created: { importId: "imp_1222321_001", importedCount: 3, skippedCount: 0, message: "Import completed" }
- 400: { code: "INVALID_CSV_FORMAT", message: "CSV must have email header" }
- 401: { code: "UNAUTHORIZED" }
- 403: { code: "FORBIDDEN" }
- 409: { code: "DUPLICATE_CONTACT", duplicate: "client1@example.test" }
- 413: { code: "FILE_TOO_LARGE" }
- 503: { code: "DB_UNAVAILABLE", retry_safe: true, retry_after: 30 }

**Idempotency:** Unique index on requestId in imports collection. Same X-Request-Id returns same importId with 200 OK, no duplicate creation. Verified in IA07.

**Updated:** 23 Oct 2026 