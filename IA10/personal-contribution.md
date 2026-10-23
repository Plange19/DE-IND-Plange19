 IA10 - Personal Contribution Summary
Student: RICHARD PLANGE RHULE - 22388739 
Team: DE-SEGP-24 Flowvantage

Questions

*1. What problem did you solve?* Locked-out users needed a safe way to regain access without an administrator. Without it, users who forgot password were stuck and had to contact admin.

*2. What did you design?* The reset flow: Frontend `Forgot Password?` -> `POST /api/v1/auth/forgot-password` with email -> backend validates format -> Firebase Admin SDK `generatePasswordResetLink()` -> Firebase sends email -> generic response `200 If account exists, email sent` for both registered and unregistered emails to prevent user enumeration. Error messages: 400 for malformed email, 500 safe message for Firebase down, no stack trace.

*3. What did you implement?* In `src/modules/auth/auth.service.ts` I wrote `forgotPassword(email)` function: validates email with class-validator, calls `admin.auth().generatePasswordResetLink(email)`, logs sanitized email `t***@ug.edu.gh`, catches `auth/user-not-found` and still returns generic 200. In `auth.controller.ts` added `POST /forgot-password` endpoint with rate-limit TODO. Configured Firebase password reset template in Firebase Console.

*4. How did you test?*
- Manual: Postman `POST localhost:3000/api/v1/auth/forgot-password` with registered `plange@st.ug.edu.gh` -> 200 + email arrived. Same with unregistered -> same 200, no email.
- Malformed `not-an-email` -> 400.
- Double-click reset link -> Firebase rejects with `invalid-action-code`.
- Local run `npm run start:dev` + check server logs for no email leak.

*5. What would you improve?* Rate limiting 5 req / 15 min per IP with `express-rate-limit`, branded email template with FlowVantage logo instead of Firebase default, and automated tests in CI: unit test for generic response + E2E test mocking Firebase.

Things I can defend

-One code file: `src/modules/auth/auth.service.ts` - line 45 `forgotPassword()` where `generatePasswordResetLink()` is called - https://github.com/UG-Syntax-Syndicate/FlowVantage-Backend/blob/main/src/modules/auth/auth.service.ts
-One test file: `src/modules/auth/auth.service.spec.ts` - test `should return generic message even if user not found` - https://github.com/UG-Syntax-Syndicate/FlowVantage-Backend/blob/main/src/modules/auth/auth.service.spec.ts
-One requirement: AUTH-04, users can reset a forgotten password via an emailed reset link (Issue #20)
-One design decision: ADR-001, use Firebase Authentication with server-side token verification, so password handling and reset emails stay with a proven service, we never store passwords.
