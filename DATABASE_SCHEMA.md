# SARS Database Schema

> Reference for the MongoDB (Mongoose) collections. Edit this file as the schema
> evolves. The PDF diagram is generated from `.tools/gen-db-pdf.js`:
> `node .tools/gen-db-pdf.js` → `SARS-Database-Schema.pdf`.

## Collections overview (10 + 1 stub)

| Collection | Purpose | Key relations |
|---|---|---|
| `Admin` | Staff accounts (super_admin / admission_officer / accountant / instructor) | → AuditLog, Payment.verified_by |
| `Student` | Person record, one per mobile number | 1—N Application, 1—N Payment |
| `Application` | One row per course application (multi-course per student) | Student, Course, ProgramLevel, Batch, Payment |
| `Payment` | Payment attempt per application | Student, Application, Admin(verified_by) |
| `CourseCategory` | Catalog grouping | 1—N Course |
| `Course` | Course offering | Category, ProgramLevel(loose), Batch |
| `ProgramLevel` | Level within a course (workshop/bootcamp, fee) | Course(loose), Batch |
| `Batch` | Batch of a course+level with capacity | Course, ProgramLevel |
| `PaymentConfig` | Singleton - bKash/Nagad numbers | — |
| `AuditLog` | Admin action journal (polymorphic target) | Admin |
| `Lead` | **Stub only** - Facebook webhook, no model yet | — |

## Relationships (cardinality)

```
CourseCategory 1 ───────── N Course
Course         1 ───────── N Application        (application.course_id)
ProgramLevel   1 ───────── N Application        (application.level_id)
Batch          1 ───────── N Application        (application.batch_id)
Student        1 ───────── N Application        (application.student_id)
Student        1 ───────── N Payment            (payment.student_id)
Application    1 ───────── N Payment            (payment.application_id)
Course         1 ───────── N Batch              (batch.course_id)
ProgramLevel   1 ───────── N Batch              (batch.level_id)
Admin          1 ───────── N AuditLog           (audit_log.admin_id)
Admin          1 ───────── N Payment            (payment.verified_by)
```

## Application status (state machine)

```
draft ──▶ pending ──▶ payment_under_review ──▶ payment_verified ──▶ admitted ──▶ cancelled
           │                │                       │
           └─── cancelled ──┴────── rejected ───────┘
rejected / cancelled are terminal.
On admitted: student_id_number auto = FARS{year}{5-digit}
```

## Payment status

```
pending ──▶ verified | rejected ──▶ refunded
```

_See `server/models/*.js` for exact schemas._