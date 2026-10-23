IA05 API Contract - Flowvantage Contact Import
Student: RICHARD RHULE 1222321 - Team: Plange19 / DE-SEGP-19
Project: Flowvantage - Feature: Contact Import
Team Issue: #7 - Requirement: As admin, I want to import contacts via CSV
Repo: https://github.com/Dept-of-Comp-Sci-University-of-Ghana/DE-SEGP-24
Personal: https://github.com/Plange19/DE-IND-Plange19
NFR: Response <2s for 100 contacts
Caller: Frontend React Admin Dashboard
Provider: Node.js Express API

Endpoint: POST /api/contacts/import
URL: https://flowvantage-api.onrender.com/api/contacts/import
Params: teamId (string, required), dryRun (boolean, optional)
Headers: Authorization Bearer JWT (required), Content-Type multipart/form-data, X-Request-Id UUID (required for idempotency)
Auth: JWT from Flowvantage login (Google/Microsoft) -> AuthZ: ADMIN or MANAGER role checked in middleware
Request Fields: file (File, required, CSV max 5MB), mapping (JSON string, required, {csvCol:dbField}), source (string, optional, enum MANUAL|CLIENT_LIST)
Validation: File CSV, email column required, teamId exists, role ADMIN, no duplicate email in file, X-Request-Id UUID v4
Success: 201 {importedCount, skippedCount, errors[], importId, teamId, requestId} -> UI shows table

youtube link 
https://youtu.be/i6tcimyULIo