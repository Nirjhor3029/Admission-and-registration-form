# Build Prompt — Facebook Admission & Registration System (FARS)
*(Use this prompt with Claude Code / any AI coding assistant to scaffold and build the full application)*

---

You are building a production-grade full-stack web application called **FARS (Facebook Admission & Registration System)** — an online student admission and registration platform for a coaching center/institute in Bangladesh, where student leads primarily come from Facebook Ads.

## Tech Stack (mandatory)
- **Frontend:** React.js + Tailwind CSS, React Router, React Hook Form + Yup/Zod validation, Axios/React Query for API calls
- **Backend:** Node.js + Express.js, REST API architecture
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (separate roles: `admin`, `student`)
- **File Uploads:** Multer → Cloudinary (student photo, payment screenshot)
- **Notifications:** Nodemailer (email), SMS Gateway integration (BD provider, use an abstracted `smsService` interface), WhatsApp Business API (abstracted `whatsappService` interface)
- **PDF Generation:** Puppeteer or pdf-lib for Invoice + Admission Letter generation
- **Facebook Integration:** Meta Lead Ads Webhook receiver endpoint (verify Meta signature)

## Core Modules to Build

### 1. Public-facing Registration Flow
- Landing page (SEO-friendly, mobile-first, works well inside Facebook in-app browser)
- Multi-section registration form: Personal Info, Course Info, Address — with client + server validation, mobile number format check (BD format), required-field enforcement
- Payment submission step: bKash/Nagad method selector, Amount, TrxID (unique — reject duplicates), Payment Date, Screenshot upload
- Confirmation screen + auto-send Email/SMS/WhatsApp confirmation

### 2. Facebook Lead Ads Webhook
- `POST /api/leads/facebook-webhook` — receive and verify Meta webhook payload, store into a `leads` collection, and optionally auto-create a partial `student` record (status: `pending`, awaiting payment) so admin can follow up even if payment isn't done yet.

### 3. Admin Dashboard (protected, JWT + role-based)
- Auth: login, role-based access (`super_admin`, `admission_officer`, `accountant`, `instructor`)
- Student CRUD + search/filter (by status, course, batch, date range, referral source)
- Payment verification screen: view screenshot + TrxID side by side, one-click Verify/Reject, auto status transition (`pending → payment_under_review → payment_verified → admitted / rejected / cancelled`)
- Course & Batch management (CRUD, capacity/seats tracking, class schedule)
- Reports: Daily/Monthly Admission, Course-wise, Payment, Income, Student — with Excel export (SheetJS) and PDF export
- Dashboard analytics: admission funnel chart, revenue chart, course-wise pie chart (use Recharts)
- Audit log of every admin action

### 4. Student Dashboard (protected, JWT)
- View own admission status, payment history, invoice (PDF download), admission letter (PDF, auto-generated on `admitted` status), Student ID
- View class schedule + downloadable course materials
- Certificate download after course completion (flag-based)

## Database Schema
Implement Mongoose schemas for: `Student`, `Lead`, `Course`, `Batch`, `Payment`, `Admin`, `AuditLog` — with proper indexes on `mobile`, `email`, `trxid` (unique), `status`.

## Non-Functional Requirements
- Input sanitization + rate limiting on all public endpoints (express-rate-limit)
- Passwords bcrypt-hashed; JWT with short-lived access token + refresh token
- All file uploads validated by type/size before Cloudinary upload
- Proper error handling middleware + consistent API response format `{ success, data, message }`
- Environment-based config (.env) for all secrets/API keys
- Write basic tests for critical endpoints (registration, payment submission, status change)

## Deliverables
1. `/backend` — Express app with folder structure: `models/`, `routes/`, `controllers/`, `middlewares/`, `services/` (sms, email, whatsapp, cloudinary, pdf), `utils/`
2. `/frontend` — React app with folder structure: `pages/`, `components/`, `hooks/`, `services/api.js`, `context/` (auth)
3. Seed script for initial Super Admin + sample Courses/Batches
4. `.env.example` listing all required environment variables
5. README with setup + run instructions

Build this module by module, starting with the database models and public registration + payment flow (Phase 1 MVP), then the Admin dashboard, then Reports/Student dashboard, then the Facebook webhook + Merchant API auto-verification (Phase 3). Confirm the plan/folder structure before writing large amounts of code.
