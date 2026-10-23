# IA05 Test Plan - Flowvantage Import API 
 Feature: Contact Import

6 Tests

 1. Valid Request
- Input: CSV with 2 valid contacts, teamId valid, ADMIN token, X-Request-Id uuid
- Expected Status: 201
- Expected Response: {importedCount:2, errors:[]}

 2. Missing Field - No file
- Input: Request without file, only teamId
- Expected Status: 400
- Expected Response: {code:"INVALID_CSV_FORMAT", message:"file is required"}

3. Unauthorized Caller - No token
- Input: Valid CSV but no Authorization header
- Expected Status: 401
- Expected Response: {code:"UNAUTHORIZED", message:"Please login again"}

 4. Conflict/Duplicate
- Input: CSV with email that already exists for team, same X-Request-Id retry
- Expected Status: 409 on first? Actually 201 first time, 201 with same result second time (idempotent). If new Id but duplicate email: 409
- Expected Response: {code:"DUPLICATE_CONTACT", details:[email]}

 5. Dependency Failure - DB down
- Input: Valid request but MongoDB disconnected (simulate)
- Expected Status: 503
- Expected Response: {code:"DB_UNAVAILABLE", message:"Import service busy, retry"}

 6. Response Shape Check
- Input: Valid request
- Expected Status: 201
- Expected Response Shape: Must have requestId (string), importedCount (number), skippedCount (number), importId (string), teamId (string)
- Check: All fields present, types correct

Trade-off / Open Question
Trade-off: Using multipart/form-data vs JSON base64 - multipart is better for large files but harder to validate. Open: Should we process CSV async with queue for 10k contacts?