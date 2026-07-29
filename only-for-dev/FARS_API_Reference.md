# FARS — API Reference

**Base URL:** `http://localhost:5000/api` (development)  
**Auth:** JWT Bearer Token (`Authorization: Bearer <token>`)  
**Response Format:** `{ success: bool, data?: {}, message?: string }`

---

## Auth — `/api/auth`

### POST `/api/auth/admin/login` — Public
Login for admin users.

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**200:** `{ token, refreshToken, admin: { id, name, email, role } }`  
**400:** Missing email/password  
**401:** Invalid credentials

---

### POST `/api/auth/student/login` — Public
Login for students (by mobile OR student_id).

| Field | Type | Required |
|---|---|---|
| `mobile` | string | either |
| `student_id` | string | either |

**200:** `{ token, refreshToken, student: { id, name, status } }`  
**400:** No identifier provided  
**404:** Student not found

---

## Public Registration — `/api/registration`

### POST `/api/registration` — Public
Create a new student registration.

**Body:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `student_name` | string | yes |
| `mobile` | string | yes (BD format: `01[3-9]XXXXXXXX`) |
| `email` | string | no |
| `whatsapp` | string | no |
| `gender` | string | no |
| `qualification` | string | no |
| `address` | string | no |
| `course_id` | ObjectId | no |
| `batch_id` | ObjectId | no |
| `referral_source` | string | no (default: `other`) |
| `student_photo` | file | no |

**201:** `{ student: { id, name, mobile, status } }`  
**400:** Missing name/mobile, invalid mobile, batch full  
**404:** Batch not found  
**409:** Mobile already exists

---

### POST `/api/registration/:id/payment` — Public
Submit payment for a registration.

**Body:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `method` | string | yes (`bkash`, `nagad`, etc.) |
| `amount` | number | yes |
| `trxid` | string | yes (auto-uppercased, unique) |
| `payment_date` | date | yes |
| `screenshot` | file | no |

**201:** `{ student: { id, name, status }, payment: { id, method, amount, trxid, status } }`  
**400:** Missing fields, invalid student status  
**404:** Student not found  
**409:** Duplicate TrxID

---

## Admin — Students (JWT required) — `/api/students`

*Roles: super_admin, admission_officer, accountant*

### GET `/api/students` — Admin
List/search/filter with pagination.

| Query | Type | Default |
|---|---|---|
| `page` | number | 1 |
| `limit` | number | 20 |
| `search` | string | — (searches name, mobile, email) |
| `status` | string | — |
| `course_id` | ObjectId | — |
| `batch_id` | ObjectId | — |
| `referral_source` | string | — |
| `start_date` | date | — |
| `end_date` | date | — |
| `sort` | string | `-createdAt` |

**200:** `{ students: [...], pagination: { page, limit, total, pages } }`

---

### GET `/api/students/:id` — Admin
Single student detail + payment history.

**200:** `{ student: {...}, payments: [...] }`  
**404:** Not found

---

### PATCH `/api/students/:id/status` — Admin
Transition student status.

| Body | Type | Required |
|---|---|---|
| `status` | string | yes |

**Valid transitions:**
```
pending → payment_under_review | rejected | cancelled
payment_under_review → payment_verified | rejected | cancelled
payment_verified → admitted | cancelled
admitted → cancelled
```

On `admitted`, auto-generates `student_id_number` (`FARS{year}{5digit}`).

**200:** `{ student: {...} }`  
**400:** Invalid transition  
**404:** Not found

---

### PATCH `/api/students/:id/payment/verify` — Admin
Verify pending payment. Sets payment → `verified`, student → `payment_verified`.

**200:** `{ student, payment }`  
**404:** Student or pending payment not found

---

### PATCH `/api/students/:id/payment/reject` — Admin
Reject payment with reason.

| Body | Type | Required |
|---|---|---|
| `reason` | string | yes |

**200:** `{ student, payment }`  
**400:** Missing reason  
**404:** Not found

---

## Courses — `/api/courses`

### GET `/api/courses` — Public
List courses. Optional `?status=active|inactive`.

**200:** `{ courses: [...] }`

---

### GET `/api/courses/:id` — Public
Single course + its batches.

**200:** `{ course, batches }`  
**404:** Not found

---

### POST `/api/courses` — Admin (super_admin, admission_officer)
| Body | Type | Required |
|---|---|---|
| `name` | string | yes |
| `code` | string | no (unique) |
| `fee` | number | yes |
| `duration` | string | yes |
| `description` | string | no |

**201:** `{ course }`  
**400:** Missing name/fee/duration  
**409:** Duplicate code

---

### PATCH `/api/courses/:id` — Admin
Update course fields.

**200:** `{ course }`  
**404:** Not found

---

### DELETE `/api/courses/:id` — Admin (super_admin only)
Delete course + its batches. Blocked if students enrolled.

**200:** `{ message }`  
**400:** Has enrolled students  
**404:** Not found

---

## Batches — `/api/batches`

### GET `/api/batches` — Public
List batches. Optional `?course_id=`.

**200:** `{ batches: [...] }`

---

### POST `/api/batches` — Admin (super_admin, admission_officer)
| Body | Type | Required |
|---|---|---|
| `course_id` | ObjectId | yes |
| `batch_name` | string | yes |
| `start_date` | date | yes |
| `capacity` | number | yes |
| `class_schedule` | string | no |

**201:** `{ batch }`  
**400:** Missing required fields

---

### PATCH `/api/batches/:id` — Admin
Update batch.

**200:** `{ batch }`  
**400:** Negative capacity  
**404:** Not found

---

## Reports (JWT required) — `/api/reports`

*Roles: super_admin, admission_officer, accountant*

### GET `/api/reports/admissions` — Admin
Admission trends. `?range=daily|monthly`

**200:** `{ report: [...], courseWise: [...] }`

---

### GET `/api/reports/payments` — Admin
Payment trends. `?range=daily|monthly`

**200:** `{ report: [...], methodWise: [...] }`

---

### GET `/api/reports/export` — Admin
Export as file. `?type=excel|pdf&report=admissions|payments`

**200:** File download (xlsx or pdf)  
**400:** Invalid type

---

## Admin Dashboard (JWT required) — `/api/admin`

*Roles: super_admin, admission_officer*

### GET `/api/admin/stats`
Dashboard summary.

**200:** `{ totalLeads, pendingPayments, admittedStudents, revenueThisMonth }`

---

## Student Dashboard (JWT required) — `/api/student`

*Student token only*

### GET `/api/student/dashboard`
Own profile, status, payment history, course/batch info.

**200:** `{ student: {...}, payments: [...], hasInvoice, hasAdmissionLetter }`  
**404:** Not found

---

### GET `/api/student/invoice`
Download invoice PDF.

**200:** PDF file  
**404:** No verified payment

---

### GET `/api/student/admission-letter`
Download admission letter PDF.

**200:** PDF file  
**403:** Not admitted  
**404:** Not found

---

### GET `/api/student/materials`
Class schedule + course info.

**200:** `{ class_schedule, course_name, batch_name }`  
**403:** Not admitted  
**404:** Not found

---

### GET `/api/student/certificate`
Download certificate PDF.

**200:** PDF file  
**403:** Not available  
**404:** Not found

---

## Status Codes Quick Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (no token / invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
