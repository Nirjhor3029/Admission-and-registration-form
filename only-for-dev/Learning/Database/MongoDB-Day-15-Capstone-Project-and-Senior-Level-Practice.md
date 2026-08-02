# MongoDB Day 15 — Capstone Project and Senior-Level Practice

This is your final practice day after learning the earlier MongoDB topics.

## 1. Should you do this after the previous days?

Yes. You should do this only after you have covered:
- basic CRUD
- schema design
- indexes
- aggregation
- transactions
- scaling and security

If you do this earlier, you may feel lost because the real challenge is not just writing queries, but making strong design decisions.

---

## 2. Capstone project goal

Build a simplified but realistic student admission and enrollment platform.

### Core entities
- Student
- Course
- Batch
- Enrollment
- Payment
- Admin
- Report

### Main features
- student registration
- course enrollment
- payment verification
- admin dashboard
- reports by course and month

---

## 3. How to practice this project

### Step 1: Write the use cases
List the major flows:
- register student
- enroll student in course
- verify payment
- generate report
- view enrollment status

### Step 2: Define the collections
Think about which data belongs where.

Example:
- Student collection for profile data
- Course collection for course metadata
- Enrollment collection for joins between student and course
- Payment collection for payment records

### Step 3: Make design decisions
Ask yourself:
- Should address be embedded or referenced?
- Should enrollment data be separate or nested?
- Should payment history be in one collection or linked?

### Step 4: Add indexes
Think about the queries you will run most often.

Examples:
- find student by email
- find enrollments by student and status
- find payments by reference id

### Step 5: Add business rules
Ask:
- Can a student enroll twice?
- What if payment retries happen?
- What if enrollment is canceled after payment?

### Step 6: Add reporting logic
Design aggregation pipelines for:
- total enrollments by course
- total payments by month
- pending payments count

### Step 7: Think about scale
Ask:
- What if 100k students register?
- What if 1M records are stored?
- What if reports become slow?

---

## 4. Senior-level thinking checklist

For every feature, ask:

- What is the main read pattern?
- What is the main write pattern?
- Which queries will be frequent?
- Which fields need indexes?
- Is this data embedded or referenced?
- What happens if the request is retried?
- What happens if the data grows a lot?
- Can this be cached later?
- Can this be made more resilient?

---

## 5. Reverse thinking exercise

For your capstone project, ask these questions:

- Which query will become slow first?
- Which collection will grow fastest?
- Which document might become too large?
- Which workflow needs transactions?
- Which update should use atomic operators?
- Which operation needs idempotency?

---

## 6. What this capstone teaches you

By completing this project, you will practice:
- schema design
- indexing
- aggregation
- transactions
- idempotency
- scaling and optimization
- professional database thinking

This is the closest thing to real-world database work without a production environment.

---

## 7. Recommended workflow

Use this order:
1. Design the collections
2. Write the core queries
3. Add indexes
4. Add aggregation queries
5. Add safety rules and idempotency
6. Review the design for scale

---

## 8. Final takeaway

Yes, you should do Day 15 only after the earlier lessons.

That is because the earlier days teach the concepts, and Day 15 teaches you how to apply them in a realistic professional way.

If you can complete this capstone with clear reasoning, you will have crossed an important milestone toward senior-level database work.
