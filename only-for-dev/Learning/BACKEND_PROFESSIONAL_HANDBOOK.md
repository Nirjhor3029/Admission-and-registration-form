# Back-End Professional Handbook — Build ANY Big Project

**Created:** 2026-08-02
**Audience:** Dev who completed the basics, wants to build serious, large-scale, professional back-ends — not just this project.

> This is the "trainer course" for becoming a professional back-end engineer. Plain English / Banglish — no Bangla font.
> Pairs with `BACKEND_LEARNING_ROADMAP.md` (project-specific) and `FRONTEND_LEARNING_ROADMAP.md`.

---

## Chapter 1 — The 5 Things That Separate Professional Back-Ends From "Works On My Machine"

A junior asks: "does it work?" A professional asks:

1. **Can it scale?** — 10 users vs 10,000,000 users. What breaks first?
2. **Can a team work on it?** — structure, naming, separation. If 10 devs touch it, does it survive?
3. **Can it fail gracefully?** — errors are a design feature, not a bug.
4. **Is it secure?** — assume someone is actively attacking it right now.
5. **Can a stranger understand it in 15 minutes?** — README, naming, consistent patterns.

Every rule in this handbook exists to serve one of these five.

---

## Chapter 2 — Professional Architecture (The Big Picture)

### 2.1 Layered Architecture (the default for 90% of professional back-ends)

Think of a back-end as onion layers. Requests travel inward; data travels outward.

```
[HTTP layer]    routers, controllers, middlewares   → "understands HTTP"
      ↓
[Service layer] business logic, use-cases, workflows → "understands the business"
      ↓
[Data layer]    repositories, models, ORM/ODM        → "understands storage"
      ↓
[Database]      MongoDB / Postgres / Redis ...
```

**The golden rule: each layer talks ONLY to the layer below it.**
- Controller → calls Service. NEVER writes DB directly (thin controllers).
- Service → calls Repository/Model. NEVER reads `req`/`res`.
- Repository → talks to DB only. NEVER contains business rules.

### 2.2 Why this matters (the test)

| Change | With layers | Without layers |
|---|---|---|
| Swap MongoDB → Postgres | Change only the Data layer | Rewrite every controller |
| Add a business rule ("no refunds after 7 days") | Change only the Service layer | Hunt through 20 files |
| Rename a field in DB | Change only model + service return | Every controller breaks |
| Add a new HTTP endpoint for existing logic | Add a thin controller reusing the service | Copy-paste logic |

**Professional habit:** Before writing any feature, ask *"which layer does this belong in?"* If you can't answer, you don't understand the feature yet.

### 2.3 The professional folder structure (scaled version)

```
src/
├── index.js                 # entry: boot config, listen
├── app.js                   # express app: middleware + routes (no listen)
│
├── config/                  # env validation, db, redis, constants
├── routes/                  # URL definitions (thin)
├── controllers/             # HTTP glue (thin)
├── middlewares/             # auth, validate, error, upload, audit
├── services/                # BUSINESS LOGIC (the heart)
├── repositories/            # DB access (queries isolated here)
├── models/                  # schema/model definitions
├── schemas/                 # request validation schemas (zod/joi)
├── utils/                   # pure helpers
├── integrations/            # external APIs (payment, sms, email, cloud)
├── jobs/                    # cron, workers, queues
├── events/                  # event definitions + handlers
├── constants/               # enums, magic numbers, messages
├── types/                   # shared types/interfaces
├── tests/                   # unit, integration, e2e
└── docs/                    # API docs (OpenAPI)
```

### 2.4 Big-project architectures beyond layers (know them, don't fear them)

| Architecture | What | When |
|---|---|---|
| **Monolith** (layered) | One app, all features | Default. Teams < 30, features < ~50. FARS is right here. |
| **Modular monolith** | One deployable, but modules are isolated (auth/, payments/, courses/ each have own routes+services+models) | Medium-large. Best "upgrade path". |
| **Microservices** | Separate deployables, own DBs, communicate via HTTP/queues | Large orgs, independent scaling. High cost, don't choose lightly. |
| **Event-driven** | Services publish/subscribe events (Kafka/RabbitMQ) | Async flows, high throughput, decoupling |

**Professional truth:** 90% of projects should be a (modular) monolith. Microservices solve *organizational* problems (teams, scaling) more than technical ones. Choose it only when you have a reason.

---

## Chapter 3 — How Professionals Think (Design First, Code Last)

### 3.1 The 6 questions before ANY feature
1. **What is the business rule?** (not "what endpoint do I add")
2. **Who can do this?** (auth + role + ownership)
3. **What data flows in/out?** (input shape, output shape)
4. **What can fail?** (list every error + status code)
5. **What are the side effects?** (counters, emails, notifications, audit logs)
6. **How will it break at scale?** (N+1, race conditions, unbounded data)

### 3.2 Think in USE-CASES, not endpoints
Instead of "I need a PUT /orders/:id", think: **"cancelOrder(user, orderId)"** is a business action. That use-case might be triggered by:
- an admin canceling
- a user canceling
- a cron job auto-canceling unpaid orders
- a support bot canceling

If you build the **use-case** (in a service), all 4 triggers reuse it. This is why services exist.

### 3.3 The "what if" mindset (train this daily)
- What if the DB is down?
- What if two people buy the last seat at once?
- What if the client sends a 10GB file?
- What if an id doesn't exist? What if it's not a valid id at all?
- What if the payment succeeds but the DB write fails?
- What if the token is expired/malformed/from another user?
- What if an email service is slow? Should the request wait for it?

Write the answer to each before writing happy-path code.

---

## Chapter 4 — Data Modeling for Real Projects (The #1 Senior Skill)

### 4.1 The decision: Embed vs Reference (MongoDB)
| Situation | Choose |
|---|---|
| Child always shown with parent, small, never independent | **Embed** (order items inside order) |
| Child is big, grows unboundedly, or independent | **Reference** (comments in a blog — own collection) |
| Many-to-many (users ↔ courses) | **Reference** both ways, or junction collection |
| One-to-many where you always want the "many" | **Reference** (batch has course_id) |

Rule of thumb: *embed what you always read together and never update alone; reference the rest.*

### 4.2 Design for your READ patterns first
Ask: "How will I query this 1000 times a day?" then design to serve that query in one hit.
- If you always show Course + Category name together → `populate` or embed the name.
- If you always list recent orders per user → index `{ user_id: 1, created_at: -1 }`.
- If a collection grows forever and you only need the last month → design a partition/archive.

### 4.3 Indexes (the performance secret — most under-taught)
- Every field in a `find` filter or `sort` that has high cardinality → index it.
- Compound indexes follow query order: `{ course_id: 1, status: 1 }`.
- Unique indexes enforce invariants (trxid unique, email unique) — the DB, not the code, is the final guard.
- **Lesson from FARS:** seats_filled increments — use `$inc` (atomic). Counters in general: atomic ops, never read-modify-write.

### 4.4 Transaction thinking
When one action touches multiple collections, ask: *"what if it half-fails?"*
- MongoDB → `session.withTransaction()`.
- Payment + mark student + increment batch = should be atomic.
- Professional rule: if money or state machines are involved, it's a transaction or it has an idempotency key.

### 4.5 Soft delete vs hard delete
- Hard delete = lose data forever. Often forbidden in regulated systems.
- Soft delete = `is_deleted: true` / `deleted_at`. Safer, auditable.
- FARS lesson: `deleteLevel` has no referential check → dangling data. Professionals ALWAYS think about what deleting X does to Y (cascade, restrict, set-null).

---

## Chapter 5 — Auth & Security (Professional Level)

### 5.1 Authentication (who are you?)
**JWT flow (industry default):**
1. Login → verify credentials → issue access token (short: 15min-1h) + refresh token (long: 7-30 days)
2. Client sends `Authorization: Bearer <access>` on every request
3. Middleware verifies signature + expiry → `req.user`
4. Access expires → client calls refresh endpoint → new access token
5. Logout / password change → invalidate refresh tokens

**Professional extras:**
- **Refresh token rotation** — every refresh issues a NEW refresh token (old one dies). Detects stolen tokens.
- **Token versioning** — a `token_version` on the user; bump it to kill all sessions.
- **Store refresh tokens hashed** in DB (in case DB leaks).
- **HTTP-only cookies** for web apps (safer than localStorage) vs Authorization header for mobile/SPA. Know both.

### 5.2 Authorization (what can you do?)
- **RBAC** (role-based) — FARS has this: `authorize('super_admin', 'admission_officer')`. Good baseline.
- **Ownership checks** — "user can only edit THEIR orders." `order.user_id === req.user.id`.
- **Attribute-based (ABAC)** — fine-grained (e.g., manager can edit only their department's reports).
- **Enforce at the BACK-END only.** The front-end hiding a button is UX, not security.

### 5.3 The security checklist (run on everything)
```
□ Validate EVERY input (whitelist, types, formats, lengths)
□ Never accept req.body wholesale (mass-assignment attack)
□ Hash passwords (bcrypt cost ≥ 12 / argon2)
□ Use parameterized queries / Mongoose casting (prevent NoSQL injection: { $ne: null } attacks)
□ Rate limit auth endpoints (brute force) — stricter than general
□ Helmet + CORS whitelist + HTTPS everywhere
□ Never log or return secrets / hashes / tokens
□ Verify the ID belongs to the requester (IDOR)
□ Set sensible upload limits + type allowlist (FARS: 5MB, JPG/PNG/WebP/GIF/PDF)
□ Handle errors without leaking stack/internal details
□ Dependency audit (npm audit) regularly
```

### 5.4 The classic attacks to know by name
- **Mass assignment** — extra fields in body get saved (e.g., user sets `role: 'admin'`). → whitelist fields.
- **NoSQL injection** — `{ "email": { "$gt": "" } }` matches everything. → never trust operators from client.
- **IDOR** — changing `/:id` to another user's id. → ownership check.
- **JWT forgery** — sending a token signed with attacker's key. → always verify signature with the real secret.
- **Brute force** — → rate limit + lockout.
- **XSS/CSRF** — mostly front-end, but know that raw HTML from users must be sanitized if ever rendered.

---

## Chapter 6 — Error Handling (The Art Seniors Master)

### 6.1 The AppError pattern (FARS already does this right — extend it)
```js
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;        // machine-readable: 'DUPLICATE_TRXID'
    this.details = details;  // field-level errors for forms
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 6.2 Operational vs Programmer errors
- **Operational** (expected, recoverable): bad input, not found, duplicate, auth failure → `AppError`, known status, safe message.
- **Programmer** (bugs): null access, syntax, DB down → unknown, log loudly, return generic 500.

```js
// errorHandler.js
if (!err.isOperational) {
  logError(err);                      // with stack, request id, user id
  return res.status(500).json({ success: false, message: 'Internal server error' });
}
res.status(err.statusCode).json({ success: false, code: err.code, message: err.message, details: err.details });
```

### 6.3 Centralize — never try/catch in every controller
One global error handler + `next(err)` everywhere. FARS does this. At scale you add:
- **Async wrapper** to avoid repeating try/catch: `wrap(fn)` or `express-async-errors`.
- **Request IDs** — every request gets an id, logged with the error, returned to client so support can trace it.
- **Error codes** — machine-readable so clients can branch logic (form fields, retries).

---

## Chapter 7 — Validation & Input Handling (Professional Standard)

### 7.1 Use a schema library (zod / joi / express-validator)
Stop hand-writing `if (!name) return...`. Define one schema:
```js
// schemas/student.js
export const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid BD mobile'),
  email: z.string().email().optional(),
  course_id: z.string().regex(/^[0-9a-f]{24}$/).optional(),  // valid ObjectId
  age: z.number().int().min(5).max(120).optional(),
});
```
Middleware validates → 400 with field errors → controller receives clean, typed data.

**Why this beats inline checks:** single source of truth, reused on every endpoint, typed, testable, auto-generates docs.

### 7.2 Validate at the boundary
- **Body** → schema (above).
- **Params** (`:id`) → must be a valid ObjectId BEFORE querying (avoid CastError noise).
- **Query** → pagination limits, whitelist sortable fields.
- **Files** → size, mimetype, magic bytes (not just extension).

---

## Chapter 8 — Logging, Monitoring & Observability

### 8.1 Structured logging
Never `console.log('user saved', user)`. Use a logger with JSON output:
```json
{ "time": "...", "level": "info", "reqId": "abc123", "route": "POST /orders", "status": 201, "durationMs": 23, "userId": "u_1" }
```
- Levels: debug < info < warn < error.
- Log request id, user id, route, status, latency on every request (morgan/winston/pino).
- NEVER log: passwords, tokens, full payment cards, hashes.

### 8.2 The 3 pillars of observability
1. **Logs** — what happened (searchable).
2. **Metrics** — how much/how fast (request rate, p95 latency, error rate, CPU/mem). Prometheus + Grafana.
3. **Traces** — the journey of one request across services. OpenTelemetry + Jaeger.

### 8.3 Health checks & alerts
- `/health` (is it alive?) + `/ready` (can it serve traffic? DB connected?).
- Alerts on: 5xx spike, p95 latency up, error rate up, disk/mem. "You only fix what you measure."

---

## Chapter 9 — Performance (Building for Scale)

### 9.1 The query optimizer's rules
1. **Index what you filter/sort.** Check with `explain('executionStats')`.
2. **Select only needed fields** — `.select('name code')` — don't ship 50 fields when you need 3.
3. **Pagination always** — `limit + skip` (offset) for small, **cursor** for large/infinite feeds.
4. **Avoid N+1** — one query with `populate`/`$lookup`/JOIN beats N queries in a loop.
5. **Lean on the DB** — `$inc`, `$push`, aggregation — don't pull data to Node to compute.
6. **Cache hot reads** — Redis: config, settings, popular lists. Invalidate on write.
7. **Beware unbounded `find()`** — every list endpoint needs a limit.

### 9.2 The bottlenecks, in order
1. Missing indexes → most common, biggest win.
2. N+1 queries (looping queries).
3. Shipping huge payloads.
4. Blocking the event loop (heavy sync CPU, huge file ops).
5. No caching on hot reads.
6. DB connection saturation.

### 9.3 Node.js event-loop awareness (what "non-blocking" really means)
- One thread does everything — if it's busy, the whole server waits.
- NEVER do CPU-heavy work synchronously in a request (image processing, PDF generation, JSON.stringify of huge data).
- Offload: worker threads, queues/jobs, or split into separate service.
- Watch for `await` on slow third-party calls — that's fine (non-blocking), just don't hold many at once without connection limits.

---

## Chapter 10 — Async Work, Queues & Jobs (The "Big Project" Tells)

### 10.1 When you need a queue
If a request triggers work that is **slow, retryable, or not needed immediately**:
- Sending emails/SMS/push
- Processing images/PDFs
- Generating reports/exports
- Calling slow third parties
- Scheduled tasks (daily digest, reminders)

**Pattern:** Request → enqueue job → return 202 immediately → worker processes → notifies (webhook, DB status, email).

**Tools:** BullMQ + Redis (Node standard), RabbitMQ, SQS (AWS), Kafka (high-throughput event log).

### 10.2 Cron / scheduled jobs
- node-cron (simple) → BullMQ repeatable jobs (scaled).
- **Idempotent jobs** — running twice must be harmless (check state before acting).
- Always log start/end/fail with duration.

### 10.3 Webhooks (your app has a stub — that's the seed of this skill)
- External systems call your URL on events (Facebook lead → you).
- You MUST verify the signature (FARS: `META_APP_SECRET` + `X-Hub-Signature`) — never trust a random POST.
- Respond fast (200 immediately), process in background.
- Provide a "resend" / replay mechanism.

---

## Chapter 11 — Testing Like a Professional

### 11.1 The test pyramid
```
        ╱ e2e ╲          few, slow, test whole journey
      ╱integration╲      some, test layers + DB
    ╱    unit      ╲     many, fast, test one function
```

### 11.2 What to test
- **Unit:** services/business rules (fee calc, status transitions, validations), pure utils.
- **Integration:** controller + service + real test DB (supertest against the app).
- **E2E:** one full journey (register → pay → verify → admit).
- **Every error path** — 401/403/404/400/409. Test the failure as much as the success.

### 11.3 Test-friendly design
- Services don't touch `req/res` → they're trivially testable.
- Use a real DB for integration tests (MongoDB-memory-server) or a test database that gets wiped per run.
- `POST /reset-test-data` or fixtures per test.
- CI runs tests on every PR — that's what makes senior code "safe to change".

---

## Chapter 12 — API Design (Contracts Matter)

### 12.1 RESTful rules
- Nouns, plural: `/orders`, `/orders/:id`, `/orders/:id/items`.
- Methods: GET (read), POST (create), PUT (full replace), PATCH (partial), DELETE.
- Sub-resources for "of": `/students/:id/payments`.
- Consistent response envelope (FARS: `{ success, data, message }`).
- HTTP status = the answer, always:
  - 200 OK · 201 Created · 202 Accepted (async job) · 204 No Content
  - 400 Bad Request · 401 Unauthenticated · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Validation
  - 500 Server Error · 503 Unavailable

### 12.2 Versioning & docs
- `/api/v1/...` — break changes don't break existing clients.
- **OpenAPI/Swagger** — document once, generate client SDKs + test from the spec. Professionals: spec-first.

### 12.3 Idempotency (pro touch)
Some operations must be safe to retry (payment submit, webhook). Client sends `Idempotency-Key`; server detects repeats and returns the original result instead of double-processing.

---

## Chapter 13 — Config, Env & Secrets

### 13.1 The rules
- `.env` → gitignored, contains real secrets.
- `.env.example` → committed, documented template with placeholders.
- `NODE_ENV` gates behavior (show stack only in dev; stricter CORS in prod).
- Validate env at boot: a schema that fails fast if `MONGODB_URI` missing (never crash mid-request).
- Rotate secrets; never hardcode anything.

### 13.2 Environments
local → staging (mirrors prod) → production. Deploy to staging first. Feature flags for gradual rollout.

---

## Chapter 14 — Deployment & Operations

### 14.1 Options
- **PaaS/serverless (easiest):** Vercel, Render, Railway, Fly — like FARS on Vercel.
- **VM (full control):** EC2 + PM2/Docker + nginx.
- **Containers (standard):** Docker + orchestration (K8s) when you have scale/complexity.

### 14.2 The production checklist
```
□ Graceful shutdown (close DB, stop accepting, finish in-flight)
□ Health/ready endpoints
□ Logging to stdout (collectable), not local files
□ Process manager (PM2 / container restart policy)
□ Reverse proxy with HTTPS (nginx / managed)
□ Backups (MongoDB Atlas has them; test a restore!)
□ Secrets not in the image/repo
□ Resource limits (memory) so it restarts instead of dying
□ Migration strategy (how do schema changes deploy?)
□ Error alerting (this is how you "sleep at night")
```

### 14.3 Databases in production
- Use a managed DB (Atlas) — backups, TLS, monitoring out of the box.
- Never open the DB to the world — restrict by IP/VPC.
- Indexes as code (migration scripts) or at least documented.

---

## Chapter 15 — TypeScript & Framework Level-Up (The Industry Standard)

### 15.1 Why TypeScript
- Catches 30%+ of bugs at compile time (typos, wrong shapes, null access).
- The data contract is executable documentation.
- Every serious job now expects it. JS is fine to *learn*; TS is what you *ship*.

### 15.2 NestJS (the professional Express successor)
NestJS wraps Express with structure: modules, controllers, providers/services, DI (dependency injection), guards, pipes, interceptors. It's the de-facto standard for big Node back-ends.

If you master the *concepts* in this handbook (layers, services, validation, guards, error handling), you'll see they're all *native* in NestJS. The handbook teaches the ideas; NestJS gives them a home.

---

## Chapter 16 — Real Projects to Practice (Level Up by Building)

Build each COMPLETELY with the professional patterns, no shortcuts:

1. **Blog/Content API** — users, posts, comments, likes, tags, search, pagination, roles.
2. **E-commerce API** — products, inventory, carts, orders, payments, stock concurrency, idempotent checkout, order state machine, admin analytics.
3. **Booking/Appointment API** — slots, conflicts, double-booking prevention (transaction), reminders (queue), calendar sync.
4. **Team/Project management API** — orgs, invites, roles per project, audit logs, activity feed, soft delete, notifications.
5. **A fintech-lite wallet** — ledger, transactions, transfer with balance checks (atomic), statements, webhooks to a mock payment provider.

For each: auth (JWT + refresh rotation), validation schemas, service layer, error architecture, tests, OpenAPI docs, Docker + deploy. That's a complete professional portfolio.

---

## Chapter 17 — The 15-Minute Senior Code Review (Run on Your Own Code)

```
□ Naming is honest and specific (cancelOrder, not doStuff)
□ Each function has ONE job
□ Controllers are thin; logic is in services
□ No raw req.body → models (whitelisted + validated)
□ No business rule in a route or model
□ Error paths return correct, safe, consistent responses
□ Atomic ops for counters ($inc) and transactions for multi-write
□ No N+1; indexes cover the hot queries
□ Secrets are env; nothing sensitive logged or returned
□ Delete ops consider referential integrity
□ No unbounded queries (pagination everywhere)
□ The README tells a stranger how to run + what it does
□ Tests cover the happy path AND the failure paths
□ A new dev could find the flow of one feature in < 5 min
```

---

## Final Training Advice

- **Patterns over frameworks.** The layered thinking, error handling, validation, data modeling, security checklist — these transfer to Node, NestJS, Django, Spring, Go. Frameworks come and go; the reasoning is the career.
- **Read the bug list in FARS_MASTER_CONTEXT.md weekly** — each bug is a mini-lesson in production reality.
- **Build the 5 projects in Chapter 16.** Nothing teaches like shipping.
- **Review your own code with Chapter 17** before anyone else sees it. That alone will put you ahead of most juniors.
- **The end goal isn't "code that works" — it's code a team can trust, scale, and change safely.**

Good luck, and when you can answer all 12 questions from the FARS roadmap checklist *plus* the 15-point review above, you are professionally ready.
