# FARS — Master Context (Single Source of Daily Truth)

**Updated:** 2026-08-02 · Read this file first — no need to re-read other notes daily.

> This file consolidates: project overview, architecture, server & client state, API shapes,
> known bugs, next steps, and dev commands. Generated from full code analysis + all notes in `only-for-dev/`.

---

## 1. What Is This Project

**FARS = Facebook Admission & Registration System.** Full-stack admission platform for a Bangladeshi coaching center. Students come from Facebook Ads, register online (course → program level → optional batch), pay via bKash/Nagad (TrxID + screenshot), and are tracked through an admission lifecycle managed by an admin dashboard.

| Layer | Stack |
|---|---|
| Frontend | React 19 · Vite 5 · Tailwind v3 · React Router v7 · React Hook Form + Zod · Axios · TanStack React Query · Recharts · react-hot-toast |
| Backend | Node.js · Express 4 · Mongoose 8 · MongoDB · JWT · bcrypt · Multer → Cloudinary · pdf-lib · xlsx · Nodemailer |
| Hosting | Both on Vercel (server = serverless node, client = SPA) |
| Lint | Client uses **oxlint** (`npm run lint`) — NOT ESLint |

**Repo layout (single repo, two projects):**
```
project/
├─ client/    # React SPA
├─ server/    # Express API
└─ only-for-dev/  # all docs/notes (dev-only, not for production)
```

---

## 2. Architecture / Data Hierarchy

```
Course (independent)
  └── ProgramLevel (STANDALONE — deliberately NO course_id)
       └── Batch (has course_id + optional level_id)
```

**Registration flow:** Landing → Step 1 (Course + ProgramLevel + optional Batch) → Step 2 (Payment) → Confirmation. Drafts can be saved/resumed anytime (`DRF-XXXXXX` code or mobile lookup).

**Status state machine (server-enforced, `VALID_TRANSITIONS`):**
```
pending → payment_under_review | rejected | cancelled
payment_under_review → payment_verified | rejected | cancelled
payment_verified → admitted | cancelled
admitted → cancelled
```
- `admitted` auto-generates student_id: `FARS{year}{5-digit}`.
- Payment statuses: `pending | verified | rejected | refunded`.

**Student status enum also includes:** `draft` (saved-but-not-submitted registrations).

---

## 3. Server — What Exists

**Structure:** `models/` (8), `routes/` (11), `controllers/` (9), `services/` (6), `middlewares/` (2), `config/`, `utils/`.

### Models (`server/models/`)
| Model | Key points |
|---|---|
| `Admin` | name, email (unique, lowercase), password_hash (bcrypt cost 12, pre-save), role enum `[super_admin, admission_officer, accountant, instructor]` (instructor used nowhere) |
| `Course` | name, code (unique), fee, duration, sort_order, description, status |
| `ProgramLevel` | name, duration, fee, time_slots[], sort_order, status — **no course_id** |
| `Batch` | course_id (ref, req), level_id (ref, opt), batch_name, start_date, capacity (min 1), seats_filled, sort_order, class_schedule, status `[upcoming,open,full,started,completed]`, `isFull()` method |
| `Student` | student_name, mobile (unique), email, whatsapp, gender `[male,female,other,prefer_not_to_say]`, qualification, student_photo_url, address, course_id/level_id/batch_id (all optional), referral_source, status, draft_code (unique sparse), student_id_number (unique sparse), certificate_generated (default false) |
| `Payment` | student_id, method `[bkash,nagad]`, amount, trxid (unique, uppercased), payment_date, screenshot_url, verified_by/at, rejection_reason, status |
| `PaymentConfig` | bkash_number, nagad_number (merchant numbers shown to students). `getSingleton()` static (findOne or create placeholder) |
| `AuditLog` | admin_id, action, target_type, target_id, details |

### Routes (mounted in `server.js`)
| Mount | Endpoints | Auth |
|---|---|---|
| `/api/auth` | POST `/admin/login`, POST `/student/login` | Public |
| `/api/registrations` | POST `/draft`, GET `/draft?q=`, POST `/`, POST `/:id/payment` | Public (multipart) |
| `/api/students` | GET `/`, GET `/:id`, PATCH `/:id/status`, PATCH `/:id/payment/verify`, PATCH `/:id/payment/reject` | Admin (super_admin, admission_officer, accountant) |
| `/api/courses` | GET `/`, GET `/:id` public; POST, PATCH admin; DELETE **super_admin only** | Mixed |
| `/api/program-levels` | GET public; POST, **PUT** `/:id`, DELETE (super_admin only) — **PUT not PATCH!** | Mixed |
| `/api/batches` | GET public; POST, PATCH admin | Mixed |
| `/api/payment-config` | GET public; **PUT** `/` admin | Mixed |
| `/api/reports` | GET `/admissions`, `/payments`, `/export` | Admin |
| `/api/admin` | GET `/stats` | Admin (super_admin, admission_officer) |
| `/api/student` | GET `/dashboard`, `/invoice`, `/admission-letter`, `/materials`, `/certificate` | Student token |
| `/api/leads` | POST `/facebook-webhook` | **Stub** — always returns "to be implemented" |

### Services (`server/services/`)
| Service | Status |
|---|---|
| `authService.js` | JWT sign/verify + refresh tokens. **No refresh endpoint, no revocation.** |
| `cloudinaryService.js` | Multer→Cloudinary, 5MB, formats JPG/PNG/WebP/GIF/PDF. Used for photo + screenshot |
| `pdfService.js` | Invoice / Admission Letter / Certificate via **pdf-lib** (Helvetica only — **no Bengali/Unicode fonts**) |
| `emailService.js` | Nodemailer SMTP. **Implemented but NEVER called** |
| `smsService.js` | Abstracted, placeholder provider. **NEVER called** |
| `whatsappService.js` | Meta Graph v18.0. **NEVER called** |

> All 3 notification services are dead code — registration/status events do NOT fire any email/SMS/WhatsApp.

---

## 4. Server — Key Business Rules & Known Bugs

### Business rules
- BD mobile regex: `/^01[3-9]\d{8}$/`
- Registration auto-increments batch `seats_filled`; batch capacity enforced
- Payment amount must equal the student's ProgramLevel fee (fixed amount)
- TrxID uppercased + unique (409 on duplicate)
- Draft codes: `DRF-` + 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- student_id on admit: `FARS{year}{5-digit-seq}`
- Whitelisted student fields only (no mass-assignment on registration)

### Known bugs / issues (BIG LIST — keep here)
1. **`courseController.getCourse`** queries `ProgramLevel.find({course_id})` → ProgramLevel has no `course_id` → always returns `[]`. Leftover from pre-refactor. Same dead `ProgramLevel.deleteMany({course_id})` in `deleteCourse`.
2. **`deleteLevel`** (super_admin) has no referential check → batches/students dangle.
3. **`updateBatch`** allows capacity < seats_filled; no guard on closing batch with students.
4. **`createRegistration`** increments `seats_filled` non-atomically (race). Does not decrement when a draft changes batch. Does not clear `draft_code` on draft→pending.
5. **`studentLogin`** — no password/OTP; anyone who knows a mobile can log in as that student.
6. **`getDashboardStats.revenueThisMonth`** sums ALL verified payments ever (no date filter despite the name).
7. **`certificate_generated`** never set true anywhere → certificate endpoint always 403.
8. **`submitPayment`** amount-check runs before required-field check (ordering nit); `payment_date` unvalidated (Invalid Date possible); method enum not pre-validated.
9. **`errorHandler`** uses fragile substring match `includes('Only'/'allowed')` for Multer errors → can misclassify errors.
10. Rate limiter is in-memory (per Vercel cold-start instance); PDF export loads ALL records into memory.
11. PDFs: Helvetica only → Bengali text breaks.
12. `instructor` role exists but is authorized nowhere.
13. CORS is wide open (`cors()` with no config).
14. Global rate limit 100 req/15min per IP — aggressive for multi-step upload flows.
15. `PaymentConfig.getSingleton()` race: two concurrent calls could create two config docs.

---

## 5. Client — What Exists

**Structure:** `src/pages/{admin,public,student}`, `src/components/ui/`, `src/layouts/AdminLayout.jsx`, `src/context/AuthContext.jsx`, `src/services/api.js`.

### Pages
| Area | Page | Notes |
|---|---|---|
| Public | `Landing` | Hero, trust badges, Apply Now CTA |
| Public | `RegistrationStep1` | Personal + Course/Level/Batch info, photo upload, draft save/resume |
| Public | `RegistrationStep2` | bKash/Nagad radio cards, fixed amount (level fee), TrxID, screenshot, merchant number from `/payment-config` |
| Public | `Confirmation` | Success + summary |
| Public | `DraftSaved` | Draft code card, copy/download PNG/TXT |
| Admin | `Login` | email/password → AuthContext.login() → redirect `/admin/overview` |
| Admin | `Overview` | KPI cards + Recharts (funnel, revenue, course pie) + recent activity (**static mock**) |
| Admin | `StudentManagement` | Table + search/filter + detail drawer + status change |
| Admin | `PaymentVerification` | Split view (student info + receipt image), verify/reject with reason |
| Admin | `CourseManagement` | Tabs: Courses | Program Levels, CRUD modals, batch capacity bars, sort_order fields |
| Admin | `Reports` | Admission/Payment tabs, daily/monthly, PDF/Excel export |
| Admin | `Settings` | Payment-config: bKash + Nagad merchant numbers |
| Student | `Dashboard` | Mobile-first, status banner, docs lock/unlock, payment history, progression |

### API data extraction patterns (CRITICAL — client must match these)
| Endpoint | Axios extraction |
|---|---|
| GET `/courses` | `r.data.data.courses \|\| []` |
| GET `/program-levels` | `r.data.data \|\| []` (bare array) |
| GET `/batches` | `r.data.data.batches \|\| []` |
| POST `/registrations` | `r.data.data?.student` |
| GET `/payment-config` | `r.data.data?.config \|\| r.data.data \|\| {}` |
| GET `/student/dashboard` | `r.data.data \|\| r.data` |

**API layer (`src/services/api.js`):** base URL `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`. Request interceptor attaches JWT from localStorage. Response interceptor: any 401 → clears storage + hard redirect to `/admin/login`.

### Client bugs / concerns
1. **`ProtectedRoute` fails-open:** `if (role && user.role && !role.includes(user.role))` — a user with NO role field (student token) passes the role guard and can access admin pages. Should fail closed.
2. **Student dashboard PDF links are raw `<a href="/api/student/invoice">`** — same-origin only; breaks when client & API are on different domains (Vercel). No auth header.
3. **Reports export via `window.open`** — no auth header; fails cross-origin.
4. **No student login / "Track Your Application" page** (documented deferred in Phase 1.2).
5. `api.js` 401 interceptor redirects public-flow 401s to `/admin/login` too (heavy-handed).
6. `Overview` recent-activity feed = static mock data.
7. `CourseManagement` defines its own private `Modal` (doesn't reuse shared one).
8. AdminLayout hardcodes version `v1.0.4`.

---

## 6. Deployment

- **Server** `vercel.json`: `@vercel/node` build of `server.js`, catch-all route. Skips `app.listen` when `process.env.VERCEL` set.
- **Client** `vercel.json`: SPA rewrites all routes → `/index.html` (deep-link routing fix committed).
- Git tree clean, `main` synced with `origin/main`.
- **Deploy steps still pending** in trackers: client Phase 7 (build config, env, deploy) and server step 8.3 (`vercel --prod` manual verify).

### Env vars (server `.env.example`)
`PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, SMS_PROVIDER, SMS_API_KEY, SMS_SENDER_ID, WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID, META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN`

Client env: `VITE_API_URL` (defaults `http://localhost:5000/api`).

---

## 7. Progress Status

- **Server tracker:** 34/38 (Phase 9 Meta = future; step 8.3 deploy = manual).
- **Client tracker:** 23/29 (Phase 7 deploy = 0/3; Phase 8 Meta = future; Phase 1.2 student login = deferred).
- **Fully working:** registration flow (draft → Step1 → Step2 → confirmation), admin (login, overview, students, payment verify, course/level/batch CRUD, reports, settings), student dashboard, BDT currency, sort_order ordering, GIF upload, error handling + toasts.
- **Not done:** deployment to Vercel, student login/track page, notifications wiring, Meta/Facebook webhook, bKash/Nagad auto-verify.

---

## 8. Next Steps (priority order)

1. Fix `ProtectedRoute` fail-open security bug.
2. Make student dashboard PDF downloads + report exports auth/cross-origin safe (fetch blob with token).
3. Fix dead `ProgramLevel.find({course_id})` in `getCourse`; add referential guard on `deleteLevel`.
4. Build student login / "Track Your Application" page (mobile + trxid lookup).
5. Clear `draft_code` on draft→pending; make `seats_filled` atomic.
6. Wire email/SMS/WhatsApp services into registration/payment/status events.
7. Deploy server + client to Vercel (remaining tracked steps).
8. Cleanup: refresh-token endpoint, date-filtered revenue, certificate_generated endpoint, Unicode PDF fonts, open CORS, remove dead code.

---

## 9. Dev Commands

```bash
# Server (port 5000)
cd server
node server.js          # start
npm run seed            # re-seed DB (admin@fars.com / admin123, 5 courses, 6 levels, 6 batches)

# Client (port 3000)
cd client
npm run dev             # dev server
npm run build           # production build
npm run lint            # oxlint

# Git
git add -A && git commit -m "message" && git push
```

---

## 10. Other Notes in `only-for-dev/` (only read these for depth)

| File | Read when... |
|---|---|
| `FARS_Server_Implementation.md` | Need phase-by-phase server checklist |
| `FARS_Client_Implementation.md` | Need phase-by-phase client checklist |
| `FARS_API_Reference.md` | ⚠️ STALE — missing payment-config, program-levels, draft endpoints |
| `FARS_Server_Deploy_Guide.md` | Deploying server to Vercel |
| `SESSION_CONTEXT.md` | Historical session log (superseded by this file) |
| `files/FARS_PRD.md` | Original product requirements |
| `image-to-text.txt` | Program level fee/time table (Workshop ৳199 … Expert ৳8000) |
| `stitch_fars_admission_portal/` | Stitch HTML design screens (visual spec) |

---
*End of master context. Update this file whenever major changes land.*
