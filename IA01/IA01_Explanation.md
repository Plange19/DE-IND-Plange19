# IA01 - FlowVantage Auth Login Request Flow

Student: RICHARD PLANGE RHULE | Project: FlowVantage | Feature: Authentication Login
GitHub: https://github.com/Plange19/DE-IND-Plange19
Demo Video: https://youtube.com/shorts/ibMp2fG4Ybs?si=VrvogOX6Bhrva36H

## 1. Overview
FlowVantage is a delivery flow management system. This IA01 traces a single user request for login. The user enters email and password on the React login page and submits. The request travels from the browser to Express API, verified via Firebase Admin SDK, checked against Neon Postgres users table, and returns a JWT token and user profile.

## 2. Detailed End-to-End Flow

**1. User Device:** The actor is a delivery manager using a Dell laptop or Android phone in Accra. The user intent is to authenticate to access dashboard. The device runs Chrome browser.

**2. App / Browser:** The client is React 18 SPA hosted at https://flow-vantage-frontend.vercel.app/. The login form collects email and password. On submit, React uses fetch/axios to create an HTTP request. The form does client-side validation for email format and required fields.

**3. Route / Endpoint:** Frontend calls `POST /api/v1/auth/login`. Base URL is `https://api.flowvantage.app`. Full route defined in Express router: `router.post('/api/v1/auth/login', rateLimiter, authController.login)`. This is a REST endpoint.

**4. Protocol / Method:** HTTPS with TLS 1.3. Method is POST because it sends credentials in body and creates a session. Headers include `Content-Type: application/json`, `Origin: https://flowvantage.app`, `User-Agent: Chrome`, and CORS preflight if needed. No credentials in URL query for security.

**5. Request Body / Headers:** JSON body example: `{ "email": "princeadu19@gmail.com", "password": "********" }`. The server never logs raw password. The request size is small (<1KB). Rate limiting header `X-Forwarded-For` is used to track IP.

**6. Validation Layer:** Before business logic, Express middleware stack runs: (a) Helmet sets security headers (X-Content-Type-Options, HSTS), (b) CORS allows only flowvantage.app origin, (c) express-rate-limit limits 5 login attempts per 15 minutes per IP to prevent brute force, (d) express.json() parses body, (e) Input validation with Joi checks email format and password min 8 chars.

**7. Authentication:** Firebase Admin SDK is not used for password check directly here; instead, our system verifies user exists in Neon. In alternative flow, if using Firebase Auth, frontend would send Firebase ID token and backend would call `admin.auth().verifyIdToken(token)`. In our FlowVantage implementation, we hash-compare password with bcrypt stored in Neon. If token-based, Firebase returns decoded token with uid, email_verified.

**8. Authorization / Middleware:** After authentication, authorization middleware checks if user role is allowed. Roles: admin, dispatcher, rider. For login, no prior token needed. After login, JWT middleware `authenticateJWT` will protect subsequent routes. For this login route, we allow public access but rate-limited.

**9. Business Logic / Controller:** `authController.login` does: (a) Find user by email in Neon Postgres `SELECT * FROM users WHERE email = $1`, (b) If not found, return 401, (c) Compare password with bcrypt.compare(), (d) If invalid, return 401 and increment failed_attempts, (e) If valid, generate JWT with `jsonwebtoken.sign({id, email, role}, JWT_SECRET, {expiresIn: '1d'})`, (f) Update last_login timestamp, (g) Return user object without password.

**10. Database / External Services:** Primary database is Neon Postgres (serverless Postgres) table `users` with columns id, email, password_hash, role, created_at, last_login, failed_attempts. Connection via pg Pool with connection string from ENV. External service: Firebase Admin SDK for optional token verification. No external API for login to keep latency low (<200ms).

**11. Response Path:** On success, server returns HTTP 200 OK with JSON: `{ "success": true, "user": { "id", "email", "role" }, "token": "eyJhbG..." }`. Frontend stores token in httpOnly cookie or localStorage (we use httpOnly for security), redirects to /dashboard. On failure, returns 401 Unauthorized with `{ "error": "Invalid credentials" }` - generic message to avoid user enumeration.

**12. What User Sees:** User sees loading spinner, then dashboard with delivery flows. If error, sees "Invalid email or password" toast. Network tab shows POST 200.

## 3. Failure Points & Handling
Three failure points: (1) Neon DB connection timeout - handled with pool retry and 503 Service Unavailable with message "Try again later". (2) Invalid credentials - 401 without leaking if email exists. (3) Rate limit exceeded - 429 Too Many Requests with Retry-After header. We log failures to console but not passwords.

## 4. Security Considerations
Security is critical for auth. We enforce HTTPS only, HSTS, CORS whitelist, rate limiting, bcrypt hashing with salt 10, JWT expiration 1 day, httpOnly cookies to prevent XSS stealing token, Helmet headers, no password in logs or response, generic error messages, and validation to prevent SQL injection using parameterized queries. Firebase token verification ensures token not tampered.

## 5. Conclusion
This flow shows complete request lifecycle from browser form to database and back. Each layer adds value: browser validation improves UX, Express middleware secures, Neon persists, JWT enables stateless auth. Video walkthrough demonstrates live request in Chrome DevTools and Neon query logs.

Word Count: ~980 words