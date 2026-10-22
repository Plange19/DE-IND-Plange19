# IA01 - Individual Request Flow Evidence - FlowVantage Backend
**Student:** Plange19 (DE-IND-Plange19)  
**Feature Traced:** POST /api/v1/auth/login  
**Stack:** Express.js REST API + Neon Postgres + Firebase Admin SDK

### 1. User Device
The request originates from a user device which is a personal computer running Windows 11 or a mobile phone. In FlowVantage context, this is the client hardware that hosts the frontend application. The device itself does not contain business logic; it only renders the UI and holds the Firebase ID token in local storage after successful authentication via Firebase client SDK.

### 2. App / Browser
The client app is a React Vite SPA running in Google Chrome / Firefox. The user interacts with the login form at https://flowvantage.app/login. On submit, the frontend does NOT send raw password to our backend. Instead it calls firebase.auth().signInWithEmailAndPassword() and receives an idToken (JWT). Then our frontend makes a fetch request: POST http://localhost:3000/api/v1/auth/login with Authorization header. This decoupling improves security.

### 3. Route / Endpoint
The exact endpoint traced is POST /api/v1/auth/login. This is defined in src/modules/auth/auth.routes.js using Express Router. The route is registered in src/app.js under /api/v1/auth. It accepts only POST method. Any GET to this path returns 404. The endpoint is versioned (v1) to allow future breaking changes without affecting existing clients.

### 4. Protocol
The protocol used is HTTPS over TLS 1.3 when deployed, and HTTP for local development (http://localhost:3000). All external traffic is enforced to HTTPS via Helmet's HSTS header. The request body is JSON with Content-Type: application/json. The connection is stateless REST. No cookies are used for this login endpoint; we use Bearer tokens to keep the API stateless and scalable.

### 5. Request Body / Headers
Headers: Content-Type: application/json, Authorization: Bearer eyJ..., Origin: https://flowvantage.app
Body: { "idToken": "eyJhbGciOiJSUzI1NiIs..." }
The idToken is a short-lived JWT (1 hour) issued by Firebase. No password is ever sent to our backend.

### 6. Validation Layer
Before reaching controller, request passes through global middleware stack in app.js:
1. helmet() - sets security headers
2. cors({ origin: allowedOrigins }) - blocks unknown origins
3. express.json({ limit: '10kb' }) - limits payload size
4. rateLimit({ windowMs: 15min, max: 100 }) - prevents brute force
5. validateAuthBody - checks if idToken exists and is string. If validation fails, returns 400 Bad Request.

### 7. Authentication
Authentication is handled by Firebase Admin SDK in src/modules/auth/auth.middleware.js. Function verifyIdToken(idToken) is called. SDK verifies signature against Google public keys, checks expiry, audience, and issuer. If token is expired or tampered, it throws auth/id-token-expired error. We catch and return 401 Unauthorized.

### 8. Authorization / Middleware
After authentication, middleware attachUser extracts uid, email from decoded token and attaches to req.user. For other routes like /api/v1/contacts, we have requireRole('admin','sales_rep') middleware that checks req.user.role fetched from Neon Postgres. This implements RBAC.

### 9. Business Logic / Controller
Controller: auth.controller.js -> login(). Steps: Receive verified uid, check if user exists in Neon Postgres SELECT * FROM users WHERE firebase_uid = $1, if not exists INSERT new record, update last_login, generate internal session JWT using SESSION_JWT_SECRET, audit log into audit_logs table. Logic is kept thin; heavy work delegated to service layer auth.service.js.

### 10. Database
Database is Neon Serverless Postgres. Connection via pg Pool with DATABASE_URL env var, SSL required. Query uses parameterized statements ($1) to prevent SQL injection. Users table: user_id (UUID PK), firebase_uid (unique), email, role, created_at, last_login. If Neon is down, controller returns 503 Service Unavailable.

### 11. Response
On success, backend returns { status: "success", data: { user: { user_id, email, role }, sessionToken, expiresIn: 3600 } } with HTTP Status 200 OK. Headers include X-Request-Id for tracing, and Cache-Control: no-store.

### 12. Error Handling & Security Benefits
400 Missing idToken, 401 Invalid token, 429 Rate limit, 500 Internal error, 503 Neon timeout. Security benefits: No passwords stored, Firebase handles MFA, parameterized SQL, rate limiting, audit logging, HTTPS + Helmet prevents MITM and XSS. This demonstrates a modern, secure, decoupled authentication architecture for FlowVantage.