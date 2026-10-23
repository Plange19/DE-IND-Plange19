 DECISION AND CONSEQUENCES

Decision. Use Option A. Firebase handles identity (credentials, Google/Microsoft sign-in, reset email). Our backend never sees passwords. It verifies the Firebase ID token on every login request, links the identity to a PostgreSQL user record, and issues its own session token 

Why this balance. I weighted client fit and security highest, because they matter most to the client and any failure there is costly. I accepted less control because our team is small and the deadline is fixed.

Benefits. Fast delivery, safer password handling, built-in social sign-in and reset email, less code to test.

Disadvantages and risks.

Dependence on Google's service; if Firebase has a problem, new sign-ins can fail.
Users exist in two places (Firebase and PostgreSQL), so they can drift apart if one write fails.
Free-tier limits and settings (for example allowed domains and email templates) need configuring correctly.

New work created. Configure the Firebase project and Admin credentials as environment variables; write a token-verification middleware; sync the user into PostgreSQL on first login; handle error cases cleanly.

Revisit if: the client needs on-premise hosting, the user count grows beyond free limits, the client requires a single-vendor policy, or Firebase pricing or terms change.

FAILURE WALKTHROUGH

Scenario chosen: Neon PostgreSQL is unreachable during login.

Step	Description
Normal path	The user enters credentials, Firebase signs them in and returns an ID token, the browser sends it in POST /api/v1/auth/login, the API verifies it with the Admin SDK, loads the user from PostgreSQL, issues the session token, and the dashboard opens.
Failing component	The database connection to Neon (timeout, paused instance or network error).
Detection	The query throws an error or times out; the API logs it and [CONFIRM: any health-check endpoint, otherwise "planned"].
What the user sees	A clear, safe message such as "We could not sign you in right now. Please try again shortly." with HTTP 503, and no technical details.
Data at risk	No data is lost, because the login flow mainly reads. The risk is a failed first-time user sync, which leaves a Firebase user with no PostgreSQL row; the next login retries it.
Logs	Server logs record the error, the time and the request ID. They must not record tokens, passwords or full emails.
Immediate mitigation / recovery	Check the Neon dashboard and connection string, restart or resume the database, and retry. Users simply sign in again.
Test of failure handling	Start the API with a wrong or blocked database URL, send a login request with a valid token, and confirm the response is 503 with the safe message, with no stack trace and no session token.