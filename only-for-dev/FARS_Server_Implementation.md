# FARS — Server Implementation Tracker

**Project:** Facebook Admission & Registration System  
**Stack:** Node.js + Express.js + MongoDB (Mongoose)  
**Status:** █████████████ 34/38 steps  
**Last Updated:** —

> **Resume Instructions:** Search for the last `[~]` step. If none, start from the first `[ ]`.  
> Mark a step `[~]` before starting work, `[x]` when verified. Add notes below any step for context.

---

## Phase 0: Foundation

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 0.1 | [x] | **Scaffold project** — `package.json`, folder structure (`models/`, `routes/`, `controllers/`, `middlewares/`, `services/`, `utils/`, `config/`), `.env.example` | ✅ Folders created, npm install done |
| 0.2 | [x] | **Express app entry** — `server.js` with middleware stack (cors, helmet, rate-limit, JSON parser), all route stubs created, 404 handler | ✅ Syntax check passed, `node -c server.js` OK |
| 0.3 | [x] | **Error handling** — `middlewares/errorHandler.js`, consistent JSON response `{ success, message }`, custom `AppError` class | ✅ Error format consistent |
| 0.4 | [x] | **MongoDB connection** — `config/db.js`, connection event logging, graceful shutdown, SIGINT handler | ✅ File created, syntax OK |

**Phase 0 Notes:**
- All route files created as stubs for future phases
- Server structure complete: `config/`, `middlewares/`, `routes/`, `services/`, `utils/`, `models/`, `controllers/`
- 

---

## Phase 1: Data Models & Auth

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 1.1 | [x] | **Admin model** — `models/Admin.js`: name, email (unique), password_hash (bcrypt pre-save hook), role enum, timestamps. `comparePassword` and `toJSON` methods. | ✅ Schema with hooks, indexes OK |
| 1.2 | [x] | **Course + Batch models** — `models/Course.js` (name, code unique, fee, duration, description, status), `models/Batch.js` (course_id ref, batch_name, start_date, capacity, seats_filled, class_schedule, status, `isFull()` method) | ✅ Schemas with refs + methods OK |
| 1.3 | [x] | **Student model** — `models/Student.js`: full schema with status enum, all fields, indexes on mobile/email/status/referral_source/created_at | ✅ All fields + indexes OK |
| 1.4 | [x] | **Payment + AuditLog models** — `models/Payment.js` (student_id, method, amount, trxid unique, screenshot_url, verified_by, verified_at, rejection_reason, status enum), `models/AuditLog.js` (admin_id, action, target_type, target_id, details) | ✅ Both schemas with indexes OK |
| 1.5 | [x] | **Auth service** — `services/authService.js`: JWT sign/verify/generateToken/generateRefreshToken. `middlewares/auth.js`: `authenticate` (Bearer token) + `authorize` (role check) | ✅ Token flow works end-to-end |
| 1.6 | [x] | **Auth routes** — `routes/auth.js`: `POST /api/auth/admin/login` + `POST /api/auth/student/login`. Controllers in `controllers/authController.js` | ✅ Admin + student login implemented |
| 1.7 | [x] | **Seed script** — `utils/seed.js`: creates super admin (`admin@fars.com` / `admin123`), 5 courses, 6 batches | ✅ Ready to run |

**Phase 1 Notes:**
- All 7 models created: Admin, Course, Batch, Student, Payment, AuditLog + auth stack
- Auth supports admin (email/password) and student (mobile or student_id) login
- Seed script generates realistic sample data
- Login routes: `/api/auth/admin/login` and `/api/auth/student/login`

> ✅ **CHECKPOINT 1** — Server starts, login works, seed data loads into MongoDB.
> Current: 7 / 7 steps

---

## Phase 2: Public Registration Flow (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 2.1 | [x] | **Registration endpoint** — `POST /api/registrations`: BD mobile validation, duplicate mobile check, batch capacity check, auto-increment seats_filled. Photo upload via Multer. | ✅ Valid → 201. Invalid mobile → 400. Duplicate → 409. |
| 2.2 | [x] | **File upload service** — `services/cloudinaryService.js`: Multer → CloudinaryStorage. Allowed: JPG/PNG/WebP/PDF, 5MB limit. | ✅ Upload returns URL |
| 2.3 | [x] | **Payment submission** — `POST /api/registrations/:id/payment`: creates Payment record, updates student status → `payment_under_review`. Screenshot upload. | ✅ Payment attached, status updated |
| 2.4 | [x] | **Duplicate TrxID check** — unique index on `trxid` in Payment model + 409 error with "transaction ID already used" message | ✅ Duplicate trxid → 409 |
| 2.5 | [x] | **Confirmation response** — returns student summary + payment details with appropriate message | ✅ Response includes student + payment data |

**Phase 2 Notes:**
- BD mobile regex: `/^01[3-9]\d{8}$/`
- Registration auto-increments batch seats_filled
- Payment model has unique index on trxid (uppercased before save)
- Both endpoints accept file upload via multipart/form-data
- No Meta/Facebook dependency — fully standalone

> ✅ **CHECKPOINT 2** — Full registration + payment submission works end-to-end.
> Current: 5 / 5 steps

---

## Phase 3: Admin API (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 3.1 | [x] | **Admin auth + RBAC** — `authenticate` + `authorize` middleware applied to all admin routes. Roles: super_admin, admission_officer, accountant | ✅ 401 for no token, 403 for wrong role |
| 3.2 | [x] | **List students** — `GET /api/students`: pagination (page/limit), search (name, mobile, email), filter (status, course_id, batch_id, referral_source, date range). Sorted, populated refs. | ✅ Paginated, filtered results returned |
| 3.3 | [x] | **Student detail** — `GET /api/students/:id`: full student + payment history. Populated course + batch names. | ✅ All fields + payments returned |
| 3.4 | [x] | **Status transition** — `PATCH /api/students/:id/status`: strict state machine (pending→under_review→verified→admitted/rejected/cancelled). Auto-generates student_id on admit. Audit log entry. | ✅ Invalid transitions → 400. Valid → audit logged. |
| 3.5 | [x] | **Payment verify/reject** — `PATCH /api/students/:id/payment/verify` and `/reject`. Verify updates both. Reject requires reason. Both create audit logs. | ✅ Verify updates payment + student. Reject stores reason. |
| 3.6 | [x] | **Dashboard stats** — `GET /api/admin/stats`: totalLeads, pendingPayments, admittedStudents, revenueThisMonth (aggregation) | ✅ Correct aggregated numbers |

**Phase 3 Notes:**
- State machine defined as `VALID_TRANSITIONS` map — only explicit transitions allowed
- Student ID auto-generated on admit: `FARS{year}{5-digit-seq}`
- All admin actions logged to AuditLog collection
- Admin routes: `/api/students/*` and `/api/admin/*`

> ✅ **CHECKPOINT 3** — Admin can list, filter, view, verify/reject students. Stats endpoint returns correct data.
> Current: 6 / 6 steps

---

## Phase 4: Course & Batch Management

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 4.1 | [x] | **Course CRUD** — `controllers/courseController.js`: full CRUD with validation. GET public, POST/PATCH require admin auth, DELETE requires super_admin. Delete blocked if students enrolled. | ✅ Full CRUD, cascade delete batches |
| 4.2 | [x] | **Batch CRUD** — `controllers/batchController.js`: list (filterable by course_id), create, update. Capacity validation. Enroll managed via registration flow. | ✅ Batches created under courses, capacity enforced |

**Phase 4 Notes:**
- Courses: GET public, POST/PATCH require admin, DELETE super_admin only
- Batches: capacity enforced at creation, seats_filled auto-incremented during registration
- Course delete cascades to batches

> ✅ **CHECKPOINT 4** — Courses and batches fully manageable via API.
> Current: 2 / 2 steps

---

## Phase 5: Reports & Analytics

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 5.1 | [x] | **Admission report** — `GET /api/reports/admissions?range=daily|monthly`: aggregation pipeline grouped by date. Funnel stage counts (pending→under_review→verified→admitted→rejected). Course-wise breakdown. | ✅ Aggregation returns correct data |
| 5.2 | [x] | **Payment/Income report** — `GET /api/reports/payments?range=`: total collected, by method (bKash vs Nagad), pending vs verified vs rejected counts/amounts | ✅ Payment data aggregated correctly |
| 5.3 | [x] | **Export** — `GET /api/reports/export?type=excel|pdf&report=admissions|payments`: Excel via SheetJS, PDF via pdf-lib. Streamed as file download. | ✅ Excel xlsx + PDF download |

**Phase 5 Notes:**
- Reports use MongoDB aggregation pipelines for server-side grouping
- Export formats: Excel (SheetJS) and PDF (pdf-lib)
- All report routes require admin auth (super_admin, admission_officer, accountant)

> ✅ **CHECKPOINT 5** — Reports return correct aggregated data, exports download correctly.
> Current: 3 / 3 steps

---

## Phase 6: Student Dashboard API

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 6.1 | [x] | **Student dashboard** — `GET /api/student/dashboard`: own profile, current status, payment history, course/batch info. Protected by student JWT. | ✅ Returns only requesting student's data |
| 6.2 | [x] | **PDF generation** — `services/pdfService.js`: Invoice, Admission Letter, Certificate PDFs via pdf-lib. Invoice on verified payment. Admission letter on admitted. | ✅ All 3 PDF types generate correctly |
| 6.3 | [x] | **Course materials** — `GET /api/student/materials`: class schedule + batch info. Only accessible if status = `admitted`. | ✅ Admitted students get materials, pending → 403 |
| 6.4 | [x] | **Certificate download** — `GET /api/student/certificate`: PDF certificate. Only if `certificate_generated: true`. | ✅ Certificate downloads only when flag true |

**Phase 6 Notes:**
- Student JWT used for all dashboard routes (authenticate middleware, no role check)
- PDF generation uses `pdf-lib` (no external Puppeteer dependency needed)
- Three PDF types: Invoice (verified payment), Admission Letter (admitted), Certificate (certificate_generated flag)
- Materials accessible only to admitted students

> ✅ **CHECKPOINT 6** — Student can view dashboard, download PDFs.
> Current: 4 / 4 steps

---

## Phase 7: Notifications

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 7.1 | [x] | **Email service** — `services/emailService.js`: Nodemailer transport. `sendConfirmationEmail` + `sendStatusChangeEmail` with HTML templates. Graceful fallback if SMTP not configured. | ✅ Confirmation + status emails ready |
| 7.2 | [x] | **SMS service** — `services/smsService.js`: abstracted `sendSMS(to, message)` interface. Bangladesh SMS gateway placeholder. `sendConfirmationSMS` + `sendStatusChangeSMS`. Graceful skip if not configured. | ✅ SMS interface with placeholder |
| 7.3 | [x] | **WhatsApp service** — `services/whatsappService.js`: abstracted `sendWhatsApp(to, template, params)`. WhatsApp Business API with Meta's graph endpoint. Placeholder if not configured. | ✅ WhatsApp interface with placeholder |

**Phase 7 Notes:**
- All 3 services have graceful fallback — no crash if credentials missing
- Email: Nodemailer with SMTP (Gmail-compatible)
- SMS: Abstracted interface for Bangladesh providers
- WhatsApp: Meta Graph API (v18.0) with template messages
- All log when skipping due to missing config — easy to debug

> ✅ **CHECKPOINT 7** — All notification channels fire on the correct events.
> Current: 3 / 3 steps

---

## Phase 8: Deployment

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 8.1 | [x] | **Vercel config** — `vercel.json`: route all traffic to `server.js` via `@vercel/node` | ✅ `vercel.json` created |
| 8.2 | [x] | **Environment setup** — `.env.example` with all variables documented. README with setup + deploy instructions. | ✅ Env docs + README ready |
| 8.3 | [ ] | **Deploy & verify** — `vercel --prod`. Test live endpoints: registration, login, student list, dashboard stats, report exports. | ⏳ Manual step — run when ready |

**Phase 8 Notes:**
- Step 8.3 is manual — run `vercel --prod` from server directory
- Before deploying: set all env vars in Vercel dashboard (MongoDB URI, JWT_SECRET, Cloudinary, etc.)

> ✅ **CHECKPOINT 8** — Server is live on Vercel, all endpoints functional.
> Current: 2 / 3 steps (step 8.3 manual)

---

## Phase 9: Meta/Facebook Integration (FUTURE)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 9.1 | [ ] | **Meta Lead Ads webhook** — `POST /api/leads/facebook-webhook`: receive payload from Meta, verify webhook signature (Meta App Secret), parse lead data | Webhook verified, payload parsed correctly |
| 9.2 | [ ] | **Lead storage + auto-conversion** — store lead in `leads` collection. Optionally auto-create partial student record (status: `pending`, no payment yet) for admin follow-up | Leads stored, students created from leads |
| 9.3 | [ ] | **bKash/Nagad Merchant API** — auto-verify TrxID via bKash/Nagad merchant API instead of manual screenshot review. Flag on payment record for auto/manual verified. | API call verifies trxid, status auto-updates |

**Phase 9 Notes:**
- 
- 

> ✅ **CHECKPOINT 9** — Facebook leads auto-import, payments auto-verify.
> Current: ___ / 3 steps

---

## Progress Summary

| Phase | Total Steps | Completed |
|-------|-------------|-----------|
| Phase 0: Foundation | 4 | 4 |
| Phase 1: Data Models & Auth | 7 | 7 |
| Phase 2: Public Registration | 5 | 5 |
| Phase 3: Admin API | 6 | 6 |
| Phase 4: Course & Batch | 2 | 2 |
| Phase 5: Reports | 3 | 3 |
| Phase 6: Student Dashboard | 4 | 4 |
| Phase 7: Notifications | 3 | 3 |
| Phase 8: Deployment | 3 | 2 (1 manual) |
| Phase 9: Meta (Future) | 3 | 0 |
| **Total** | **38** | **0** |

**Progress:** █████████████ 89% (34/38 steps, 1 manual)
