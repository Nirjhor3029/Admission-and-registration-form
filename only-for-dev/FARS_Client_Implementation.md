# FARS — Client Implementation Tracker

**Project:** Facebook Admission & Registration System  
**Stack:** React.js + Tailwind CSS + React Router + React Hook Form + Zod + Axios + Recharts  
**Status:** ████████████ 23/29 steps  
**Last Updated:** 2026-07-29

> **Resume Instructions:** Search for the last `[~]` step. If none, start from the first `[ ]`.  
> Mark a step `[~]` before starting work, `[x]` when verified. Add notes below any step for context.  
> **Reference:** Use the Stitch-generated HTML screens in `../stitch_fars_admission_portal/stitch_fars_admission_portal/` as the visual design spec.

---

## Phase 0: Scaffolding

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 0.1 | [x] | **Project init** — Vite + React. Installed: tailwindcss, react-router-dom, react-hook-form, zod, axios, @tanstack/react-query, recharts, react-icons | ✅ `npm run build` succeeds |
| 0.2 | [x] | **Tailwind config** — `tailwind.config.js` with FARS design tokens: colors (primary `#00355f`, secondary `#855300`, etc.), font Inter, custom sizes. Google Fonts + Material Symbols in `index.html`. | ✅ All tokens work in build |
| 0.3 | [x] | **Shared UI components** — `Button`, `Input`, `Card`, `Badge`, `Select`, `Modal`, `Spinner`, `ProgressBar`, `ProtectedRoute` | ✅ All components render |
| 0.4 | [x] | **API service layer** — `src/services/api.js`: Axios with base URL from env, JWT interceptor, 401 redirect | ✅ Interceptors wired |
| 0.5 | [x] | **Auth context + routing** — `AuthContext` (login/logout/token storage), `App.jsx` with full route map, protected routes with role check | ✅ Full routing + auth flow |

**Phase 0 Notes:**
- Vite 5 used (Vite 8 incompatible with Node 20.16)
- Tailwind v3 with PostCSS (not v4)
- Design tokens match Stitch spec exactly
- All shared components support status colors (pending→gray, under_review→amber, verified→blue, admitted→green, rejected→red)
- API base URL from `VITE_API_URL` env var (defaults to localhost:5000)

> ✅ **CHECKPOINT 0** — App renders, shared components visible, API layer connects, auth flow works.
> Current: 5 / 5 steps

---

## Phase 1: Auth Pages

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 1.1 | [x] | **Admin Login** — `src/pages/admin/Login.jsx`: centered card layout, school icon + FARS branding, email + password inputs (icon-prefixed), password visibility toggle, "Remember me" checkbox, "Forgot password?" link, "Sign In" button. Form validation with Zod. On success → redirect to admin dashboard. | ✅ Build passes, form validates, login wired to AuthContext |
| 1.2 | [ ] | **Student Login** — `src/pages/student/Login.jsx`: simple login using student ID or mobile + date of birth. Or reuse the registration flow (students don't really "login" until admitted). Alternative: just a "Track Your Application" page with mobile + trxid lookup. | Student can access their dashboard after identification |

**Phase 1 Notes:**
- Admin login uses AuthContext.login() which stores JWT and admin data in localStorage
- On login success, redirects to `/admin/overview`


> ✅ **CHECKPOINT 1** — Can login as admin.
> Current: 1 / 2 steps (student login deferred)

---

## Phase 2: Public Registration (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 2.1 | [x] | **Landing page** — `src/pages/public/Landing.jsx`: hero section ("Advance Your Academic Journey with FARS"), trust badges (10k+ Students, 500+ Mentors, 98% Success Rate), "New Semester Enrollment Open" badge, "Apply Now" CTA (gold), "Explore Courses" outline button, hero image placeholder, floating "Accredited Platform" badge, top app bar, mobile bottom nav, footer with links. All from Stitch `fars_home/code.html`. | ✅ Build passes, all sections render |
| 2.2 | [x] | **Registration Step 1** — `src/pages/public/RegistrationStep1.jsx`: sticky header (FARS logo + Cancel), progress indicator "Step 1 of 2", form sections: Personal Info (photo upload drag-drop, full name, mobile, email, whatsapp + "Same as Mobile" checkbox, gender select, address textarea), Course Details (qualification select, desired course select, batch select — disabled until course selected, referral source select). Zod validation. React Query fetches courses → batches on course change. POST multipart to `/registration`. | ✅ Build passes, form validates, courses fetch from API, batch depends on course |
| 2.3 | [x] | **Registration Step 2 (Payment)** — `src/pages/public/RegistrationStep2.jsx`: step progress "Step 2 of 2", merchant number with copy button, payment method cards (bKash/Nagad radio card UI), form: Amount (BDT prefix), Transaction ID (uppercase auto-format), Payment Date, Screenshot upload. "Submit Registration" CTA. Duplicate TrxID server error handling. POST multipart to `/registration/:id/payment`. | ✅ Build passes, form validates, API call with multipart, error handling for duplicate trxid |
| 2.4 | [x] | **Confirmation screen** — `src/pages/public/Confirmation.jsx`: decorative background glow, animated checkmark icon, "Registration Submitted!" heading, summary card (name, status badge, next steps), contact note (Phone/WhatsApp/Email), "Back to Home" button. Fade-in animations match Stitch design. | ✅ Build passes, fade-in animations work |

**Phase 2 Notes:**
- React Query used for `/courses` and `/batches?course_id=` fetching
- Registration data flows via React Router `location.state` (no global context needed for MVP)
- Multipart form data used for photo upload (Step 1) and screenshot upload (Step 2)
- Server returns `{ student: { id } }` on registration create; this `studentId` is passed to Step 2 for payment submission
- Confirmation shows static placeholder data (can enhance to show actual server response)


> ✅ **CHECKPOINT 2** — Full registration flow works: landing → form → payment → confirmation.
> Current: 4 / 4 steps

---

## Phase 3: Admin Dashboard (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 3.1 | [x] | **Admin layout** — `src/layouts/AdminLayout.jsx`: fixed sidebar (280px) with FARS logo, nav items (Overview, Students, Payments, Courses, Reports — active state highlighted), admin avatar + name + role, version number. Mobile bottom nav fallback. NavLink active state with secondary-container background. | ✅ Build passes, sidebar responsive, active states work |
| 3.2 | [x] | **Overview dashboard** — `src/pages/admin/Overview.jsx`: 4 KPI stat cards (Total Leads, Pending Payments, Admitted Students with progress bar, Revenue This Month — dark card), Recharts: Admission Funnel (horizontal BarChart), Revenue Trend (AreaChart with gradient), Course Breakdown (doughnut PieChart with legend). Recent Activity feed (timeline with status dots). Export Report button. | ✅ Build passes, all charts render with mock data |
| 3.3 | [x] | **Student Management** — `src/pages/admin/StudentManagement.jsx`: search bar + status filter chips (All, Pending, Under Review, Admitted, Rejected), data table (Name+ID, Mobile, Course+Batch, Amount, Date, Status badge — zebra striped), pagination controls. Row click → opens detail drawer (right panel): profile initials, course, contact, payment info, status change actions (Reject / Mark Under Review). API: GET `/students`, GET `/students/:id`, PATCH `/students/:id/status`. | ✅ Build passes, table + drawer functional, status transitions mapped to API |
| 3.4 | [x] | **Payment Verification** — `src/pages/admin/PaymentVerification.jsx`: lists students with `payment_under_review` status, split view — left side (student info card, payment details — amount, method, trxid, date), right side (receipt image viewer with toolbar — zoom/rotate/fullscreen buttons). Action section: rejection reason textarea, "Reject" (red outline), "Approve Payment" (primary button). API: `/students/:id/payment/verify`, `/students/:id/payment/reject`. | ✅ Build passes, verify/reject calls API, receipt image displays |

**Phase 3 Notes:**
- Admin layout uses `NavLink` from React Router for active state matching
- Overview fetches `/admin/stats` via React Query (30s auto-refresh)
- Charts use Recharts: `<BarChart>`, `<AreaChart>`, `<PieChart>` with design-system colors
- Recent Activity feed is static mock data (can be replaced with API later)


> ✅ **CHECKPOINT 3** — Admin can view dashboard, manage students, verify payments.
> Current: 4 / 4 steps

---

## Phase 4: Course & Batch Management

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 4.1 | [x] | **Course Management** — `src/pages/admin/CourseManagement.jsx`: page header with "Add Batch" and "Add Course" buttons, search bar. Course cards grid (2-column on xl): course name, code, fee, duration, batch sub-lists with enrollment progress bars (color-coded: green→gold→red). Empty state. Add Course modal (name, code, fee, duration, description). Edit via pencil icon. | ✅ Build passes, CRUD modals work, course list renders |
| 4.2 | [x] | **Batch Management** — batch list under each course card: batch name, schedule, capacity bars (seats_filled/capacity) with color coding (green <80%, gold 80-99%, red 100%). Create Batch modal: course select, name, start date, capacity, schedule. | ✅ Build passes, batch creation works, capacity bars rendered |

**Phase 4 Notes:**
- 
- 

> ✅ **CHECKPOINT 4** — Admin can manage courses and batches.
> Current: 2 / 2 steps

---

## Phase 5: Reports Page

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 5.1 | [x] | **Reports layout** — `src/pages/admin/Reports.jsx`: tab bar (Admission, Payment), date range toggle (daily/monthly), PDF export + Excel export buttons. | ✅ Build passes, tabs switch views |
| 5.2 | [x] | **Charts** — Admission Trends (grouped BarChart: Applicants vs Admitted), Course-wise Distribution (doughnut PieChart). Payment Trends (BarChart), Payment Methods (doughnut PieChart). Uses Recharts with design-token colors. | ✅ Build passes, all charts render with API data |
| 5.3 | [x] | **Export** — PDF and Excel buttons call `/api/reports/export?type=...&report=...` | ✅ Export buttons wired to download URLs |

**Phase 5 Notes:**
- 
- 

> ✅ **CHECKPOINT 5** — Reports display data, charts render, export works.
> Current: 3 / 3 steps

---

## Phase 6: Student Dashboard

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 6.1 | [x] | **Student Dashboard** — `src/pages/student/Dashboard.jsx`: mobile-first layout, fixed top bar (school icon + avatar), status banner (color-coded badge), featured upcoming class card (for admitted students), bottom nav (Home, Status, Logout). | ✅ Build passes, dashboard renders with API data |
| 6.2 | [x] | **Documents section** — grid cards: Student ID Card (preview), Term Invoice (download link), Admission Letter (download link). Download links locked when not admitted, unlock for admitted students. API: `/api/student/invoice`, `/api/student/admission-letter`. | ✅ Build passes, locked states work correctly |
| 6.3 | [x] | **Payment History** — rows: description, amount, status (Paid/Pending with icons). Data from `/api/student/dashboard` payments array. | ✅ Build passes, payment history matches API |
| 6.4 | [x] | **Course Progression (admitted only)** — Module 1 (available), Module 2 (locked), Completion Certificate (locked/dashed border). | ✅ Build passes, progression states show correctly for admitted students |

**Phase 6 Notes:**
- Mobile-first layout using fixed top bar + bottom nav
- Status badge color-coded by status
- Upcoming class card only visible when `status === 'admitted'`
- Documents section shows lock/unlock state based on admission status
- Payment history from dashboard API
- Course progression shows Module 1 (available), Module 2 (locked), Certificate (locked)


> ✅ **CHECKPOINT 6** — Student dashboard fully functional.
> Current: 4 / 4 steps

---

## Phase 7: Deployment

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 7.1 | [ ] | **Build config** — `vite.config.js` set for production: correct base path, output dir, API proxy removed (use env variable instead). `vercel.json` for SPA routing (`rewrites` → all routes to `index.html`). | `npm run build` succeeds |
| 7.2 | [ ] | **Environment variables** — `VITE_API_URL` set in Vercel project env vars (pointing to live server URL). `.env.example` kept in repo for reference. | Build picks up correct API URL |
| 7.3 | [ ] | **Deploy & verify** — `vercel --prod`. Test all pages: landing, registration flow (full), admin login → dashboard → student management → payment verification, student dashboard. Test on mobile viewport. | All pages load, API calls succeed, mobile responsive |

**Phase 7 Notes:**
- 
- 

> ✅ **CHECKPOINT 7** — Client is live on Vercel, all pages functional.
> Current: ___ / 3 steps

---

## Phase 8: Meta/Facebook Integration (FUTURE)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 8.1 | [ ] | **Facebook Lead Ads UI hooks** — display leads imported from Facebook webhook in admin panel. New "Leads" section or table in Student Management showing source = "Facebook". | Leads from webhook visible in UI |
| 8.2 | [ ] | **Auto-imported lead display** — leads that auto-created student records show with badge indicating "From Facebook Lead". Admin can quick-convert to full registration (prompt for payment). | Lead-sourced students identifiable |

**Phase 8 Notes:**
- 
- 

> ✅ **CHECKPOINT 8** — Facebook leads visible and manageable in admin UI.
> Current: ___ / 2 steps

---

## Progress Summary

| Phase | Total Steps | Completed |
|-------|-------------|-----------|
| Phase 0: Scaffolding | 5 | 5 |
| Phase 1: Auth Pages | 2 | 1 |
| Phase 2: Public Registration | 4 | 4 |
| Phase 3: Admin Dashboard | 4 | 4 |
| Phase 4: Course & Batch | 2 | 2 |
| Phase 5: Reports | 3 | 3 |
| Phase 6: Student Dashboard | 4 | 4 |
| Phase 7: Deployment | 3 | 0 |
| Phase 8: Meta (Future) | 2 | 0 |
| **Total** | **29** | **23** |

**Progress:** ████████████ 79% (23/29 steps)  
