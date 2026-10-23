# IA07 Test Evidence - Contact Import
Student: RICHARD RHULE 1222321 | Team: DE-SEGP-19 / Flowvantage
Feature: POST /api/contacts/import

## Test Setup
Base URL: https://flowvantage-api.onrender.com/api/contacts/import
Auth: Bearer JWT ADMIN token (admin@test.flowvantage.local)
Tool: Postman + Jest + MongoDB Atlas
Synthetic data only - no real PII

## Test 1: Valid Request -> 201 Created
Script: IA07/test-scripts/01-valid-import.test.js
Request: POST with file contacts.csv (3 rows), teamId team_plange19_001, requestId 550e8400-e29b-41d4-a716-446655440001
Expected: 201 {importedCount:3, skippedCount:0}
Result: PASS - Screenshot IA07/evidence/01-valid.png
Evidence: 201, importedCount 3

## Test 2: Missing File -> 400 INVALID_CSV_FORMAT
Script: 02-missing-file.test.js
Request: POST without file
Expected: 400 {code: "INVALID_CSV_FORMAT", message:"CSV must have email header"}
Result: PASS - Screenshot 02-missing.png

## Test 3: No Token -> 401 UNAUTHORIZED
Script: 03-no-auth.test.js
Request: POST without Authorization header
Expected: 401 {code:"UNAUTHORIZED"}
Result: PASS - Screenshot 03-401.png

## Test 4: Duplicate Email -> 409 DUPLICATE_CONTACT (Idempotent retry)
Script: 04-duplicate.test.js
Request: Same file twice with same requestId 550e8400-e29b-41d4-a716-446655440002
First call: 201
Second call (retry): 201 with same importId - idempotent
Expected: 409 first duplicate insert, but idempotency returns previous 201
Result: PASS - Screenshot 04-duplicate.png + 04-retry-idempotent.png
Handles: Duplicate handling from IA05

## Test 5: DB Down -> 503 DB_UNAVAILABLE (Retry safe)
Script: 05-db-down.test.js
Simulate: MongoDB disconnected
Request: POST valid
Expected: 503 {code:"DB_UNAVAILABLE", message:"Import service busy, retry"}
Retry with same X-Request-Id after DB up: 201
Result: PASS - Screenshot 05-503.png

## Test 6: Response Shape Check
Script: 06-shape.test.js
Check: response has importedCount (number), skippedCount (number), importId (string)
Expected: All fields present + type correct
Result: PASS - Jest output screenshot 06-shape.png

## Summary
6/6 PASS, Idempotency verified for retry, Unique index prevents duplicates

Video: https://youtube.com/shorts/ibMp2fG4Ybs timestamp 13:00-16:00