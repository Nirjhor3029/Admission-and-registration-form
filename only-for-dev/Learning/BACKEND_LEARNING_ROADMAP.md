# Back-End Learning Roadmap (For FARS Server + Any Node/Express Project)

**Created:** 2026-08-02
**Audience:** Junior dev who knows basic JS, wants to (1) fully understand THIS server and (2) think & work like a professional back-end engineer.

> Write in plain English / Banglish — no Bangla font.

---

## PART 1 — Everything to understand THIS server (FARS)

The server is Node.js + Express + Mongoose (MongoDB). It is a textbook example of the **MVC pattern** (Model-View-Controller — here there's no View, it returns JSON).

### Step 0 — The request lifecycle (READ THIS FIRST, then everything clicks)
A request flows through these layers in order:

```
Client (React) → server.js (middleware) → route → controller → model → MongoDB
                                                 ↓ (error?)
                                          errorHandler → JSON response
```

**Real example (POST /api/courses):**
1. `server.js` line 31-42 — Express routes the URL to `routes/course.js`
2. `routes/course.js` — checks auth (`authenticate`) + role (`authorize`), then calls controller
3. `controllers/courseController.js` — validates, builds the data
4. `models/Course.js` — Mongoose talks to MongoDB, enforces schema rules
5. `server.js` — response goes back as JSON

**Professional habit:** Before writing any code, always trace the flow: *URL → route → middleware → controller → model → DB → response → error path.*

### Step 1 — Entry point: `server/server.js` (read this 3 times)
| Line | What it teaches |
|---|---|
| 1 | `dotenv.config()` — loads `.env` secrets into `process.env` |
| 2-5 | Third-party middleware: `express`, `cors`, `helmet` (security headers), `rateLimit` (anti-abuse) |
| 7-8 | `connectDB()` + `errorHandler` — imported, then wired at the end |
| 15-18 | Global middleware — applied to EVERY request: helmet, cors, JSON body parser (10mb limit) |
| 20-25 | Rate limiter: max 100 req/15 min per IP |
| 27-29 | `/health` endpoint — a "ping" to check server is alive |
| 31-42 | **The routing table** — every `/api/...` prefix mounts a route file |
| 44-46 | 404 fallback — if no route matched, return JSON 404 |
| 48 | `errorHandler` — LAST middleware, catches everything passed via `next(err)` |
| 50-54 | `app.listen` only when NOT on Vercel (serverless skips it) |

**Key insight:** Middleware order = execution order. Global middleware first, routes in the middle, error handler LAST. This order matters hugely in Express.

### Step 2 — The model layer (Mongoose schema) — `server/models/`
Read `Batch.js` — it's the best example.

| Feature | Line | Concept |
|---|---|---|
| `new mongoose.Schema({...})` | 3 | Define the data shape |
| `type: mongoose.Schema.Types.ObjectId, ref: 'Course'` | 5-9 | **Reference** — links to another collection (like a foreign key) |
| `required: [true, 'Course is required']` | 7 | Validation + custom error message |
| `enum: ['upcoming','open','full',...]` | 43 | Allowed values whitelist |
| `default: 0` | 30 | Default when not provided |
| `{ timestamps: true }` | 47 | Auto adds `createdAt`/`updatedAt` |
| `batchSchema.methods.isFull()` | 50-52 | Custom method on every doc |

**Understand the model = understand the business.** Each model maps to a real thing: Course, ProgramLevel, Batch, Student, Payment, Admin, PaymentConfig, CourseCategory, AuditLog.

**Data relations in this app (think like a database designer):**
```
CourseCategory 1──N Course
Course        1──N Batch   (course_id)
ProgramLevel  1──N Batch   (level_id)   ← ProgramLevel is STANDALONE
Student       N──1 Course / ProgramLevel / Batch  (optional)
Student       1──N Payment (student_id)
```

### Step 3 — The controller layer — `server/controllers/`
This is where the brain lives. Read `programLevelController.js` first (simplest), then `registrationController.js` (most advanced).

**The universal controller shape** (every one follows this):
```js
const listLevels = async (req, res, next) => {
  try {
    // 1. read input from req.body / req.params / req.query
    // 2. validate input (return AppError 400 if bad)
    // 3. talk to the model (find / create / update / delete)
    // 4. respond with res.json({ success: true, data: ... })
  } catch (err) {
    next(err);   // 5. on ANY error, hand it to errorHandler
  }
};
```

**`registrationController.js` — the professional patterns inside:**
| Line | Pattern | Why |
|---|---|---|
| 7 | `BD_MOBILE_REGEX = /^01[3-9]\d{8}$/` | Named regex constant, business rule in one place |
| 9-16 | `generateDraftCode()` | Small pure helper function |
| 18-36 | `pickStudentFields()` + `sanitizeStudentFields()` | **Whitelisting** — only take the fields you allow. Security: never accept `req.body` wholesale. |
| 38 | `NULLABLE_ID_FIELDS` | Constants for special-cased fields |
| 55-112 | `saveDraft` | Handle BOTH create and update in one function (if draft_id exists → update, else → create) |
| 121-133 | Dynamic query building | Same function handles "search by code" OR "search by mobile" |
| 145-231 | `createRegistration` | Full validation chain: mobile format → level exists → batch exists → batch full? → then act |
| 177-190 | Referential checks | Before saving an id, verify the referenced doc EXISTS. Prevents dangling references. |
| 212-214 | `$inc: { seats_filled: 1 }` | Atomic increment — read current value, add 1, write back — all in one DB operation |

**Business logic lives in controllers here** (acceptable for this size). In bigger apps it moves to a `services/` layer — see Part 3.

### Step 4 — The route layer — `server/routes/`
Read `course.js`, `courseCategory.js`, `auth.js`.

```js
router.get('/', listCourses);                                          // public
router.get('/:id', getCourse);                                         // public
router.post('/', authenticate, authorize('super_admin',...), create);  // protected
```
- `authenticate` = "who are you?" (has a valid token?)
- `authorize(...roles)` = "are you allowed?" (role check)
- **Route order matters** — `/:id` after `/` so `/something` doesn't collide. `/:id/courses` style sub-routes must come before or after carefully.

### Step 5 — Middleware: auth + errors — `server/middlewares/`
**`auth.js`** — THE security core:
- Reads `Authorization: Bearer <token>` header
- Verifies JWT signature via `authService.verifyToken`
- On success: `req.user = decoded` (now every later middleware/controller knows who's calling)
- On failure: `next(new AppError('...', 401))` → errorHandler → 401 JSON

**`errorHandler.js`** — central error brain:
- `ValidationError` (Mongoose) → 400 with messages
- `code === 11000` (duplicate key) → 409
- `CastError` (bad ObjectId) → 400
- `err.statusCode || 500` — AppError carries its own status
- `err.isOperational ? err.message : 'Internal server error'` — **NEVER leak internal errors to clients**, but log them (line 23-25)
- `stack` shown only in development

**`utils/AppError.js`** — the key class:
```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;   // ← "expected" error, safe to show message
    Error.captureStackTrace(this, this.constructor);
  }
}
```
Professionals throw `new AppError('msg', 400)` for ANY expected error, and `next(err)` for everything. This one class is used in every controller.

### Step 6 — Services layer — `server/services/`
Reusable business capabilities that don't belong in controllers:
- `authService.js` — JWT sign/verify (used by middleware)
- `cloudinaryService.js` — file upload → Cloudinary
- `pdfService.js`, `emailService.js`, `smsService.js`, `whatsappService.js`

**Professional note:** these are "integrations" — replaceable parts (e.g., swap SMS provider without touching controllers). Notice email/SMS/WhatsApp exist but aren't wired to events yet — that's your future project.

### Step 7 — Config & utils — `server/config/`, `server/utils/`
- `config/db.js` — connection + retry-with-public-DNS logic + graceful shutdown. Read the `SIGINT` handler (line 30-33): close DB cleanly when server stops.
- `utils/seed.js` — a script (run with `npm run seed`) that wipes and re-inserts demo data. **Every profession team has a seed script.**

---

## PART 2 — Everything to learn to build ANY back-end project

Master in this order. This is the professional checklist.

### Level A — The foundation (must be rock solid)
1. **Node.js fundamentals** — modules (`require`), `process`, fs, paths, events
2. **HTTP & REST** — methods (GET/POST/PUT/PATCH/DELETE), status codes (200/201/400/401/403/404/409/500), URLs, headers, JSON
3. **Express** — routing, params, query strings, middleware, error handling, `req`/`res`/`next`
4. **Postman / curl / Thunder Client** — testing APIs like a professional (before touching UI)

### Level B — Data layer (this is where the "back-end brain" is)
5. **MongoDB** — collections, documents, CRUD, indexes, the shell/Atlas
6. **Mongoose** — schemas, validation, refs/populate, queries, middleware (pre/post), methods/statics
7. **SQL mindset (optional but valuable)** — if you learn one relational DB (PostgreSQL/MySQL) too, you understand *when* to choose which
8. **Data modeling** — the professional skill: designing collections, relations (1-1, 1-N, N-N), when to embed vs reference, indexes for performance

### Level C — Security & correctness (what separates juniors from pros)
9. **Authentication vs Authorization** — JWT, bcrypt/hashing, tokens, refresh tokens, protecting routes
10. **Input validation & sanitization** — NEVER trust the client. Whitelist fields, validate types/formats (you saw this in `pickStudentFields`)
11. **Error handling architecture** — AppError class, global error handler, operational vs programmer errors
12. **Rate limiting, helmet, CORS, HTTPS** — the security baseline
13. **Secrets management** — `.env`, never commit secrets, env per environment
14. **Avoiding common bugs** — mass assignment, IDOR (accessing others' data), N+1 queries, race conditions (atomic `$inc`)

### Level D — Real-world engineering
15. **File uploads** — multer, cloud storage (Cloudinary/S3), size/type limits
16. **Logging & monitoring** — morgan/winston, request IDs, structured logs
17. **Testing** — unit (Jest), integration (supertest), API tests
18. **Performance** — indexes, `.select()` to limit fields, pagination, caching, avoiding N+1
19. **Deployment** — serverless (Vercel/Render) vs VM (EC2), `vercel.json`, environment config
20. **Background jobs** — cron, queues (BullMQ), webhooks (this app has a Facebook webhook stub)
21. **Design patterns** — MVC, service layer, repository, dependency injection (concepts)
22. **Git & CI/CD** — branches, PRs, automated tests on push

### Level E — Leveling up to architect
23. **TypeScript on the server** — NestJS is the industry standard (built on Express, but structured)
24. **Clean architecture** — entities → use-cases → adapters; how large companies structure back-ends
25. **Microservices vs monolith** — when each makes sense (FARS is a monolith — correct choice for this size)
26. **Message queues & event-driven design** — Kafka/RabbitMQ, when to use
27. **Caching** — Redis, when and why
28. **Load, scaling, observability** — the "running it in production" layer

---

## PART 3 — How professionals THINK (the mindset)

The user asked: *"professional ra kivabe ki chinta kore"* (how do professionals think). Here are the actual thinking loops they run before/while writing server code.

### 1. Think in the REQUEST LIFECYCLE first
Before coding, mentally draw:
```
What URL? What method? → Who's allowed? → What input do I need?
→ What do I validate? → What does the DB do? → What JSON do I return?
→ What if ANYTHING fails? (error path)
```

### 2. Think about the 4 status codes per endpoint
For every endpoint ask: "What are all the ways this can fail?"
- 400 = bad input from client
- 401 = not logged in
- 403 = logged in but not allowed
- 404 = resource doesn't exist
- 409 = conflict (duplicate)
- 500 = server bug (don't leak details)

### 3. NEVER trust the client (the #1 rule)
- Client can send anything. Validate every field.
- Whitelist which fields you accept (`pickStudentFields`).
- Never do `Model.create(req.body)`.
- Never send the whole DB object to the client — shape your response (`data: { student: { id, name, ... } }`).

### 4. Think about DATA INTEGRITY
- If I save `batch_id`, is that batch real? (referential check)
- If a batch is full, can I still add students? (capacity check)
- If I delete a course, what happens to its batches/students? (referential guard — FARS has a bug here, see below)
- Are increments atomic? (`$inc`, not read-modify-write)

### 5. Design the API for the CLIENT
- Consistent response shape everywhere: `{ success: bool, data: ..., message: ... }`
- Give the client the exact fields it needs (no more, no less)
- Meaningful error messages that a human can read and act on

### 6. Write code that is READABLE, not clever
- Short functions with clear names (`saveDraft`, `createRegistration`)
- Validation at the top of a function (fail fast)
- One concern per function; extract helpers (`generateDraftCode`, `sanitizeStudentFields`)
- Comments ONLY for "why", never for "what"

### 7. Think about the EXCEPTION path with the same care as the happy path
Every `try` must have `catch (err) { next(err) }`. Every expected failure must be an `AppError` with a correct status code. Errors are a first-class feature, not an afterthought.

### 8. Security by default
- Passwords hashed (bcrypt, cost 12) — check `Admin.js`
- Tokens expire; middleware verifies on every protected call
- Headers secured via helmet; rate limits on public endpoints
- Logs never contain secrets

### 9. Learn from THIS project's known bugs (professionals read other people's bugs)
From `FARS_MASTER_CONTEXT.md` — each is a lesson:
1. `getCourse` queries `ProgramLevel.find({ course_id })` but ProgramLevel has no `course_id` → always `[]`. **Lesson: refactor = update ALL dependent queries.**
2. `deleteLevel` has no referential check → dangling batches/students. **Lesson: think about deletions' side effects.**
3. `createRegistration` increments seats non-atomically → race condition. **Lesson: use `$inc` for counters.**
4. `studentLogin` needs no password → anyone with a mobile can log in. **Lesson: security by design, not after.**
5. Payment amount check runs before required-field check. **Lesson: validate ALL inputs together; check errors in logical order.**
6. `certificate_generated` never set → endpoint always 403. **Lesson: wire the whole feature, not just the endpoint.**

---

## PART 4 — Professional folder structure (server side)

### The standard Node/Express professional structure

```
server/  (or project root)
├── src/
│   ├── config/          # DB, env, constants, app config
│   ├── models/          # Mongoose schemas ONLY (no logic)
│   ├── controllers/     # HTTP layer: req/res handling, validation
│   ├── services/        # Business logic (pure, no req/res)
│   ├── routes/          # URL → controller wiring + auth middleware
│   ├── middlewares/     # authenticate, authorize, validate, errorHandler, upload
│   ├── utils/           # AppError, helpers, formatters, regexes
│   ├── validators/      # (optional) zod/joi/express-validator schemas
│   ├── jobs/            # (optional) cron jobs, workers
│   ├── integrations/    # (optional) external: cloudinary, sms, email, payment
│   ├── tests/           # unit + integration tests
│   ├── app.js           # express app (no listen)
│   ├── server.js        # entry: config + app.listen
│   └── index.js         # or combined entry
├── .env                 # secrets (gitignored)
├── .env.example         # documented template (committed)
├── vercel.json / dockerfile
├── package.json
└── README.md
```

### WHY each folder exists (the reasoning)
| Folder | Purpose | Why professionals insist on it |
|---|---|---|
| `config/` | Connection + env + app settings | Secrets and setup live in exactly one place |
| `models/` | Data shape + rules | Schema = contract with the DB; no HTTP logic here |
| `controllers/` | HTTP glue (req/res) | "Thin controllers" = readable; heavy logic moves out |
| `services/` | Business rules | Testable without HTTP; reusable across controllers/routes/jobs |
| `routes/` | URL mapping + guards | One look tells you every endpoint + its access rules |
| `middlewares/` | Reusable request pipeline | authenticate used on 20 routes = write once, reuse |
| `utils/` | Pure helpers | `AppError` is the backbone of all error handling |
| `validators/` | Input schemas | Validation separate from controllers = single source of rules |
| `tests/` | Proof it works | The professional safety net |

### The "thin controller, fat service" rule (the #1 refactor professionals do)
FARS puts business logic in controllers (fine for now). Professional scaling does this:

```
BEFORE (FARS style):              AFTER (professional):
routes → controller (all logic)   routes → controller (thin: validate + call service + respond)
                                          → services (business logic)
                                          → models
```

**Why?** The same business rule (e.g., "batch can't be full") is now callable from an API, a cron job, and a test — without HTTP context.

### Controller anatomy professionals agree on
```js
// 1. Validate request (body/params/query)
// 2. Call service (business logic)
// 3. Send response (shape it — never send raw model)
// 4. Catch → next(err)
// NEVER: DB queries scattered in controllers, raw req.body into models,
//        leaking internal errors, inconsistent response shapes.
```

---

## PART 5 — 30-day server study plan (practical, on FARS)

| Days | Topic | Practice on FARS |
|---|---|---|
| 1-2 | Node + Express basics | Trace every request in server.js; map all 12 routes |
| 3-4 | Read models | Draw the relations diagram for all 9 collections |
| 5-7 | Mongoose queries + populate | Rewrite `findDraft` to add a new populated field |
| 8-10 | Controllers + AppError | Add a new endpoint to `courseController` following the pattern |
| 11-12 | Middleware (auth, error) | Write a new `validateRole` middleware; test it in Postman |
| 13-14 | Auth + JWT + bcrypt | Trace login: read authController + authService end-to-end |
| 15-16 | Input validation | Add whitelisting to a controller that doesn't have it |
| 17-18 | File upload | Understand cloudinaryService; upload via Postman |
| 19-20 | Fix a real bug | Fix bug #1 from the known-bugs list (dead `course_id` query) |
| 21-23 | Write API tests | Supertest: test `listCategories` and a 401 case |
| 24-25 | Indexes & performance | Add an index to a collection; measure with `explain()` |
| 26-27 | Security review | Go through the bug list; classify each as input/auth/integrity |
| 28-29 | Deploy locally | Run the server on Vercel-like config; understand vercel.json |
| 30 | Build a mini API | A todo API: auth + CRUD + validation + error handling — using ONLY the patterns from FARS |

---

## PART 6 — The professional's mental checklist before shipping any endpoint

```
□ 1. Is the URL RESTful? (/resource, /resource/:id, nested where needed)
□ 2. Correct HTTP method? (GET read, POST create, PUT full update, PATCH partial, DELETE)
□ 3. Auth: who can call this? authenticate + authorize roles?
□ 4. Input: every field validated + whitelisted?
□ 5. Business rules enforced? (batch full? level exists? amount matches fee?)
□ 6. Referential integrity? (saved ids point to real docs?)
□ 7. Concurrency safe? ($inc for counters, unique indexes for dupes)
□ 8. Response: consistent shape { success, data, message }, right fields only?
□ 9. Errors: every failure path → AppError with correct status?
□ 10. Security: no secrets leaked, no internal errors leaked, headers safe?
□ 11. Performance: indexed queries? select() limiting fields? no N+1?
□ 12. Tested in Postman for: happy path + each error path + auth cases?
```

If you can answer all 12 for every endpoint you write, you are already thinking like a professional back-end engineer.

---

## Final advice

- **FARS is your textbook.** Every concept above exists in `server/` — read a file, then read the roadmap section, then read the file again.
- **Postman is your best friend.** The fastest way to "get it" is sending requests and reading the JSON responses + errors.
- **Read the bug list in FARS_MASTER_CONTEXT.md weekly.** Each bug teaches a real production lesson no tutorial gives you.
- **Think in failures.** The difference between junior and senior back-end code is how much time is spent on the error path.
- When you can fix any of the 15 known bugs confidently, you're production-ready.

Good luck — this is a genuinely well-structured server to learn from.
