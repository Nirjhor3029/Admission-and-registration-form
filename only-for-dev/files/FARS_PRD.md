# Product Requirements Document (PRD)
## Facebook Admission & Registration System (FARS)

**Version:** 1.0
**Stack:** React.js (Frontend) + Node.js / Express.js (Backend) + MongoDB (Database)
**Prepared for:** Build & Development Team

---

## 1. Executive Summary

FARS is an end-to-end online admission and registration platform designed for coaching centers / institutes that acquire students primarily through **Facebook Ads, Facebook Page, and Facebook Lead Ads (Instant Forms)**. Students land on a registration form (either a native Facebook Instant Form or a web landing page), submit their information, pay the course fee via **bKash/Nagad**, and get tracked through a full admission lifecycle managed by an Admin Dashboard — from `Pending` to `Admitted`.

The system removes manual, spreadsheet-based admission handling and replaces it with a real-time, verifiable, and reportable digital pipeline.

---

## 2. Goals & Objectives

- Convert Facebook ad traffic into verified, paying students with minimal manual work.
- Provide a trustworthy, mobile-first registration + payment experience.
- Give admin staff a single dashboard to verify payments, manage admissions, and generate reports.
- Give students a self-service dashboard to track their status, download admission letters, and access course materials.
- Reduce fraud/errors in manual payment verification (bKash/Nagad TrxID cross-check).

---

## 3. User Personas

| Persona | Description | Key Needs |
|---|---|---|
| **Prospective Student** | Comes from a Facebook ad, may register from mobile | Fast, trustworthy form; clear payment instructions; instant confirmation |
| **Admin/Admission Officer** | Verifies payments, manages courses/batches, approves admission | Fast search/filter, clear payment proof, bulk actions, reports |
| **Enrolled Student** | Post-admission | Status tracking, invoice, class schedule, materials, certificate |

---

## 4. Core Workflow

```
Facebook Ad/Page (Instant Form or "Apply Now" button)
        │
        ▼
Meta Lead Ads Webhook  ──(optional, for Instant Forms)──▶  Auto-create Lead in FARS
        │                                                          │
        ▼                                                          ▼
Web Registration Form (if not Instant Form) ──────────────▶ Student Record Created
        │
        ▼
bKash / Nagad Payment (manual submission: TrxID + screenshot)
        │
        ▼
Status: Pending → Payment Under Review
        │
        ▼
Admin verifies TrxID/screenshot manually or via bKash/Nagad Merchant API
        │
        ▼
Status: Payment Verified → Admitted  (or Rejected/Cancelled)
        │
        ▼
Auto-generated: Student ID, Invoice, Admission Letter (PDF), SMS/Email/WhatsApp confirmation
        │
        ▼
Student Dashboard unlocked (schedule, materials, certificate on completion)
```

---

## 5. Functional Requirements

### 5.1 Lead Acquisition (Facebook Integration)
- FR1: Support both entry points:
  - **Facebook Lead Ads (Instant Form)** via Meta Lead Ads Webhook/API — data pulled automatically into FARS as a `Lead`.
  - **Standard "Apply Now" button** → redirects to FARS web landing page + registration form.
- FR2: Store `referral_source` (Facebook Ad, Facebook Page, Website, Friend, YouTube) on every lead/student.
- FR3: Facebook Pixel + Conversion API integration for ad optimization (optional/professional tier).

### 5.2 Online Registration Form
- FR4: Capture Personal Info — Full Name, Mobile* (required), Email, WhatsApp Number, Gender, Student Photo upload, Educational Qualification.
- FR5: Capture Course Info — Course Name (dropdown), Batch (dropdown), Referral Source (dropdown).
- FR6: Capture Address.
- FR7: Client-side + server-side validation (mobile format, required fields, file size/type for photo).
- FR8: Mobile-responsive, single-page form optimized for Facebook in-app browser.

### 5.3 Payment Module
- FR9: Support bKash Merchant and Nagad Merchant.
- FR10: Capture Payment Method, Amount Paid, Transaction ID (TrxID), Payment Date, Payment Screenshot upload.
- FR11: (Optional/professional) bKash/Nagad **Merchant API** integration for automatic TrxID verification instead of manual screenshot review.
- FR12: Prevent duplicate TrxID submission (unique constraint + admin alert).

### 5.4 Confirmation & Notifications
- FR13: On submit, show on-screen confirmation message.
- FR14: Send confirmation via Email, SMS, and WhatsApp Business API.
- FR15: Notify student automatically on every status change (Verified / Rejected / Admitted).

### 5.5 Admin Dashboard
- FR16: List/search/filter all student records with all captured fields + payment screenshot preview.
- FR17: Admission Status management: `Pending → Payment Under Review → Payment Verified → Admitted / Rejected / Cancelled`.
- FR18: Student Management (Add/Edit/Delete/Search/Profile view).
- FR19: Payment Management (Verify, Pending list, Verified list, Refund status).
- FR20: Course Management (Add/Update Course, Batch Management, Class Schedule).
- FR21: Role-Based Access Control (Super Admin, Admission Officer, Accountant, Instructor).
- FR22: Audit Log of all admin actions (who verified/rejected what, when).

### 5.6 Reports
- FR23: Daily/Monthly Admission Report, Course-wise Report, Payment Report, Income Report, Student Report.
- FR24: Export to Excel and PDF.
- FR25: Admission Dashboard & Revenue Dashboard with charts (course-wise admission analytics, daily trend).

### 5.7 Student Dashboard
- FR26: View Admission Status, Payment History, Invoice, Admission Letter (PDF, auto-generated), Student ID.
- FR27: View Class Schedule, download Course Materials.
- FR28: Download Certificate after course completion.

### 5.8 Optional / Phase 2 Features
- Auto Student ID generation, Auto Invoice generation, QR-code verification on admission letter.
- Waiting List Management + Batch Capacity Management.
- SEO-friendly landing page + Google Analytics.
- Backup & Restore, SSL, full audit trail.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Form submission response < 2s; dashboard list pagination for 10k+ records |
| Security | JWT auth, bcrypt password hashing, HTTPS/SSL, input sanitization, rate-limiting on public form endpoint |
| Scalability | Stateless API (horizontally scalable), MongoDB indexes on mobile/email/trxid/status |
| Availability | 99.5% uptime target; daily automated DB backup |
| Compliance | Secure storage of payment screenshots (Cloudinary, access-controlled) |
| Mobile | Fully responsive; must work well inside Facebook/Instagram in-app browser |
| Localization | Bangla + English UI support |

---

## 7. Data Model (MongoDB Collections)

**students**
```
_id, student_name, mobile, email, whatsapp, gender, qualification,
student_photo_url, address, course_id, batch_id, referral_source,
payment_method, amount, trxid, payment_date, payment_screenshot_url,
status [pending|payment_under_review|payment_verified|rejected|admitted|cancelled],
student_id_number, created_at, updated_at
```

**leads** (from Facebook Instant Form, pre-registration)
```
_id, fb_lead_id, name, email, phone, form_id, ad_id, campaign_name,
converted_to_student (bool), created_at
```

**courses**
```
_id, name, fee, duration, description, status, created_at
```

**batches**
```
_id, course_id, batch_name, start_date, capacity, seats_filled, class_schedule
```

**payments**
```
_id, student_id, method, amount, trxid, screenshot_url, verified_by,
verified_at, status [pending|verified|rejected|refunded]
```

**admins**
```
_id, name, email, password_hash, role [super_admin|admission_officer|accountant|instructor], created_at
```

**audit_logs**
```
_id, admin_id, action, target_type, target_id, timestamp
```

---

## 8. API Overview (REST)

```
POST   /api/leads/facebook-webhook        # Meta Lead Ads webhook receiver
POST   /api/registrations                 # Public: student submits registration
POST   /api/registrations/:id/payment     # Public: student submits payment proof
GET    /api/students                      # Admin: list/search/filter
GET    /api/students/:id
PATCH  /api/students/:id/status           # Admin: change admission status
POST   /api/courses | PATCH /api/courses/:id
POST   /api/batches | PATCH /api/batches/:id
GET    /api/reports/admissions?range=
GET    /api/reports/payments?range=
GET    /api/reports/export?type=excel|pdf
POST   /api/auth/login (admin + student)
GET    /api/student/dashboard             # Student: own status/invoice/schedule
```

---

## 9. Technology Stack

- **Frontend:** React.js, Tailwind CSS, React Query/Axios, React Hook Form
- **Backend:** Node.js, Express.js, JWT Authentication, Multer (uploads)
- **Database:** MongoDB (Mongoose ODM)
- **File Storage:** Cloudinary (student photo, payment screenshot)
- **Integrations:** Meta Lead Ads API/Webhook, bKash/Nagad Merchant API (or manual verification), SMTP (email), SMS Gateway (local BD provider), WhatsApp Business API
- **PDF Generation:** Puppeteer or pdf-lib (Invoice, Admission Letter)
- **Hosting:** VPS or cloud (with SSL)

---

## 10. Development Phases

| Phase | Scope |
|---|---|
| Phase 1 (MVP) | Registration form, manual payment (screenshot+TrxID), Admin dashboard (status management, student CRUD), Email/SMS confirmation |
| Phase 2 | Course/Batch management, Reports (Excel/PDF export), WhatsApp notification, Student dashboard |
| Phase 3 | Facebook Lead Ads webhook auto-import, bKash/Nagad Merchant API auto-verification, Certificate module, Analytics dashboards |
| Phase 4 (Optional) | QR verification, Waiting list, Facebook Pixel/GA integration, Audit log, RBAC granularity |

---

## 11. Success Metrics

- % of Facebook leads converted to verified admissions
- Average time from registration → admission verification
- Payment verification error/dispute rate
- Admin time saved vs. manual/spreadsheet process
