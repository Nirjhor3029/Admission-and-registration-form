# FARS — Client Implementation Tracker

**Project:** Facebook Admission & Registration System  
**Stack:** React.js + Tailwind CSS + React Router + React Hook Form + Zod + Axios + Recharts  
**Status:** █░░░░░░░░░░░ 0/35 steps  
**Last Updated:** —

> **Resume Instructions:** Search for the last `[~]` step. If none, start from the first `[ ]`.  
> Mark a step `[~]` before starting work, `[x]` when verified. Add notes below any step for context.  
> **Reference:** Use the Stitch-generated HTML screens in `../stitch_fars_admission_portal/stitch_fars_admission_portal/` as the visual design spec.

---

## Phase 0: Scaffolding

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 0.1 | [ ] | **Project init** — `npm create vite@latest client -- --template react`. Install deps: `tailwindcss`, `@tailwindcss/vite`, `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`, `axios`, `@tanstack/react-query`, `recharts`, `react-icons` | `npm run dev` starts without errors |
| 0.2 | [ ] | **Tailwind config** — `tailwind.config.js` with FARS design tokens: colors (primary `#00355f`, secondary `#855300`, etc.), font family (Inter), custom spacing, border radius. Import Google Fonts (Inter) + Material Symbols in `index.html`. | All tokens available in dev tools |
| 0.3 | [ ] | **Shared UI components** — `src/components/ui/`: `Button` (variants: primary, secondary, outline, ghost, danger), `Input` (with icon, error state), `Card`, `Badge` (status colors), `Modal`, `Select`, `ProgressBar`, `Spinner`, `FileUpload` (drag & drop). All from Stitch screens. | All components render with correct styling |
| 0.4 | [ ] | **API service layer** — `src/services/api.js`: Axios instance with base URL from env, request interceptor (attach JWT token), response interceptor (handle 401 → redirect to login, parse errors). | Interceptors fire correctly on requests/responses |
| 0.5 | [ ] | **Auth context + routing** — `src/context/AuthContext.jsx`: login/logout, token storage (localStorage), user state. `src/App.jsx`: React Router setup with protected routes (`<ProtectedRoute>` component), role-based redirect (admin vs student). | Auth persists on refresh, protected routes redirect unauthenticated users |

**Phase 0 Notes:**
- 
- 

> ✅ **CHECKPOINT 0** — App renders, shared components visible, API layer connects, auth flow works.
> Current: ___ / 5 steps

---

## Phase 1: Auth Pages

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 1.1 | [ ] | **Admin Login** — `src/pages/admin/Login.jsx`: centered card layout, school icon + FARS branding, email + password inputs (icon-prefixed), password visibility toggle, "Remember me" checkbox, "Forgot password?" link, "Sign In" button. Form validation with Zod. On success → redirect to admin dashboard. | Login works, JWT stored, redirect to `/admin/dashboard` |
| 1.2 | [ ] | **Student Login** — `src/pages/student/Login.jsx`: simple login using student ID or mobile + date of birth. Or reuse the registration flow (students don't really "login" until admitted). Alternative: just a "Track Your Application" page with mobile + trxid lookup. | Student can access their dashboard after identification |

**Phase 1 Notes:**
- 
- 

> ✅ **CHECKPOINT 1** — Can login as admin and student.
> Current: ___ / 2 steps

---

## Phase 2: Public Registration (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 2.1 | [ ] | **Landing page** — `src/pages/public/Landing.jsx`: hero section ("Advance Your Academic Journey with FARS"), trust badges (10k+ Students, 500+ Mentors, 98% Success Rate), "New Semester Enrollment Open" badge, "Apply Now" CTA (gold), "Explore Courses" outline button, hero image with overlay gradient, floating "Accredited Platform" badge, footer (Privacy, Terms, Contact). Mobile responsive. | Page matches Stitch `fars_home/code.html` design |
| 2.2 | [ ] | **Registration Step 1** — `src/pages/public/RegistrationStep1.jsx`: sticky header (FARS logo + Cancel), progress indicator "Step 1 of 2", form sections: Personal Info (photo upload drag-drop, full name, mobile, email, whatsapp + "Same as Mobile" checkbox, gender select, address textarea), Course Details (qualification select, desired course select, batch select — disabled until course selected, referral source select). Zod validation. | Form validates, data saved to state/context, "Next: Payment" advances to step 2 |
| 2.3 | [ ] | **Registration Step 2 (Payment)** — `src/pages/public/RegistrationStep2.jsx`: step progress "Step 2 of 2", merchant number with copy button, payment method cards (bKash selected, Nagad — radio toggle card UI), form: Amount (BDT), Transaction ID (uppercase auto-format, 10 char), Payment Date, Screenshot upload (drag-drop). "Submit Registration" CTA. Duplicate TrxID error handling. | Payment submits, shows loading, redirects to confirmation on success |
| 2.4 | [ ] | **Confirmation screen** — `src/pages/public/Confirmation.jsx`: decorative background glow, animated checkmark icon, "Registration Submitted!" with fade-in animation, summary card (name, course, trxid), contact note (Phone/WhatsApp/Email), "Go to Student Dashboard" button. | Confirmation displays correct submitted data |

**Phase 2 Notes:**
- 
- 

> ✅ **CHECKPOINT 2** — Full registration flow works: landing → form → payment → confirmation.
> Current: ___ / 4 steps

---

## Phase 3: Admin Dashboard (MVP)

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 3.1 | [ ] | **Admin layout** — `src/layouts/AdminLayout.jsx`: fixed sidebar (280px) with FARS logo, nav items (Overview, Students, Payments, Courses, Reports — active state highlighted), admin avatar + name + role, version number. Mobile bottom nav fallback. Content area with top header bar. Responsive: sidebar on desktop, bottom nav on mobile. | Layout renders, sidebar navigation works, active page highlighted |
| 3.2 | [ ] | **Overview dashboard** — `src/pages/admin/Overview.jsx`: 4 KPI stat cards (Total Leads, Pending Payments, Admitted Students — with progress bar, Revenue This Month), Charts section using Recharts: Admission Funnel (horizontal bar), Revenue Trend (line chart, 6-month), Course Breakdown (doughnut/pi chart). Recent Activity feed (timeline with status dots). Export Report button. | Charts render with mock data, stats visible |
| 3.3 | [ ] | **Student Management** — `src/pages/admin/StudentManagement.jsx`: search bar + status filter chips (All, Pending, Admitted, Rejected), data table (Name+ID, Mobile, Course+Batch, Amount, Date, Status badge — zebra striped, sortable), pagination. Row click → opens detail drawer (right panel): profile initials, applied course, batch, mobile, email, payment details, proof of payment thumbnail. Action footer: Reject + Verify & Admit buttons. Status change calls API. | Table loads students from API, drawer shows details, status change works |
| 3.4 | [ ] | **Payment Verification** — `src/pages/admin/PaymentVerification.jsx`: back button + "Verify Transaction" title + reference number + status badge. Split view: left pane (student info card, payment details — amount, date, method, bank, allocation breakdown), right pane (receipt image viewer with toolbar — zoom, rotate, fullscreen). Floating action bar: rejection reason input, "Reject" (red outline), "Approve Payment" (primary button). | Verify/reject updates status via API, image viewer functional |

**Phase 3 Notes:**
- 
- 

> ✅ **CHECKPOINT 3** — Admin can view dashboard, manage students, verify payments.
> Current: ___ / 4 steps

---

## Phase 4: Course & Batch Management

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 4.1 | [ ] | **Course Management** — `src/pages/admin/CourseManagement.jsx`: mobile top bar + sidebar (Courses active), page header with "Add Batch" and "Add Course" buttons, search/filter bar (text + department + status selects). Course cards grid (2-column on xl): course name, code, batch sub-lists with enrollment progress bars (color-coded: primary/green, secondary/gold, error/red). Empty state for no batches. Add/Edit modals. | Courses listed, CRUD modals work |
| 4.2 | [ ] | **Batch Management** — batch list under each course card: batch name, schedule, capacity (seats_filled/capacity), status chip (Started/Open/Full — colored). Create Batch modal: name, start date, capacity, schedule inputs. Capacity bars turn red when full. | Batches created, capacity tracking displayed correctly |

**Phase 4 Notes:**
- 
- 

> ✅ **CHECKPOINT 4** — Admin can manage courses and batches.
> Current: ___ / 2 steps

---

## Phase 5: Reports Page

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 5.1 | [ ] | **Reports layout** — `src/pages/admin/Reports.jsx`: sidebar (Reports active), header with date range picker (react-date-range or custom), PDF export + Excel export buttons. Tab bar: Admission, Payment, Income, Student (each tab loads different data). | Tabs switch views, date range updates data |
| 5.2 | [ ] | **Charts** — Admission Trends (bar chart: Applicants vs Admitted grouped by week/month), Payment chart, Income chart. Uses Recharts. Colors pulled from Tailwind design tokens. Custom tooltips. | Charts render with real API data |
| 5.3 | [ ] | **Report data table + export** — data table below charts: Date, Department, Program, Applicants, Admitted, Status (Complete/Processing/Delayed with colored chips). Pagination. Export buttons call API endpoints and download files. | Table paginates, Excel/PDF download triggers |

**Phase 5 Notes:**
- 
- 

> ✅ **CHECKPOINT 5** — Reports display data, charts render, export works.
> Current: ___ / 3 steps

---

## Phase 6: Student Dashboard

| # | Status | Step | Verification |
|---|--------|------|-------------|
| 6.1 | [ ] | **Student Dashboard** — `src/pages/student/Dashboard.jsx`: mobile-first layout (all screens `md:hidden` or responsive). Fixed top bar (school icon + avatar), status banner (color-coded badge: Pending/Under Review/Verified/Admitted), featured card (upcoming class with time + "Join Virtual Class" button). Bottom nav: Home, Status, Profile. | Status displays correctly, upcoming class shows |
| 6.2 | [ ] | **Documents section** — grid cards: Student ID Card (preview), Term Invoice (download), Admission Letter (download). Download buttons trigger API → PDF download. Invoice and letter only available when status = `admitted`. | PDFs download, locked states shown correctly |
| 6.3 | [ ] | **Payment History + Course Progression** — Payment History rows: description, amount, status (paid/pending). Course Progression: Module 1 (available/completed), Module 2 (locked), Completion Certificate (locked/dashed border). | Payment history matches API, progression states correct |
| 6.4 | [ ] | **Certificate download** — certificate card shows "Download" when `certificate_generated` flag is true, "Locked" with lock icon when false. PDF download on click. | Certificate downloads only when unlocked |

**Phase 6 Notes:**
- 
- 

> ✅ **CHECKPOINT 6** — Student dashboard fully functional.
> Current: ___ / 4 steps

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
| Phase 0: Scaffolding | 5 | 0 |
| Phase 1: Auth Pages | 2 | 0 |
| Phase 2: Public Registration | 4 | 0 |
| Phase 3: Admin Dashboard | 4 | 0 |
| Phase 4: Course & Batch | 2 | 0 |
| Phase 5: Reports | 3 | 0 |
| Phase 6: Student Dashboard | 4 | 0 |
| Phase 7: Deployment | 3 | 0 |
| Phase 8: Meta (Future) | 2 | 0 |
| **Total** | **29** | **0** |

**Progress:** █░░░░░░░░░░░ 0% (0/29 steps)
