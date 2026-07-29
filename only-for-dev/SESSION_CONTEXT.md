# FARS — Session Context (2026-07-29)

## How to Resume
1. Open this repo in opencode
2. The session context below captures **all decisions, file changes, API shapes, and next steps**
3. Run `npm run dev` in `client/` and `node server.js` in `server/` to start both
4. Continue from **Next Steps** section

---

## Architecture Overview

### Data Hierarchy
Course (independent)
  └── ProgramLevel (independent, no course_id)
       └── Batch (has course_id + level_id)

### Registration Flow
User → Landing → Step 1 (Course + Level + Batch optional) → Step 2 (Payment) → Confirmation

### Admin Tabs
Courses | Program Levels (tabs with search, CRUD modals)

---

## All Commits (in order)

| Commit | Message | Files |
|--------|---------|-------|
| `5d4918d` | Feat: initial commit-server part done | Server scaffold |
| `4c79990` | add server deplument guide | Docs |
| `30ed221` | Initial client setup - FARS React frontend with all pages | Full client scaffold |
| `fda8879` | Fix: wrap app in QueryClientProvider for React Query | `main.jsx` |
| `331c86c` | Feat: add ProgramLevel CRUD, cascade UI, and level_id in batch/registration | 13 files — ProgramLevel model+controller+routes, seed update, client CourseMgmt+Step1 |
| `d9c93a3` | Refactor: ProgramLevel standalone model, batch optional in registration, batch edit UI | 8 files — removed course_id from ProgramLevel, batch_id optional in Zod, batch edit buttons |
| `6813eff` | Feat: BDT currency, sort_order, error handler fixes, GIF support, redirect fix | 17 files — `$`→`৳`, sort_order on Course/Level/Batch, error handler improved, GIF support, registration redirect fix |
| `ef44245` | Fix: registration payment API endpoint typo | `RegistrationStep2.jsx` — `/registration/` → `/registrations/` |
| `bd8d72f` | Feat: add react-hot-toast, success/error toasts in registration flow | 5 files — installed `react-hot-toast`, added `<Toaster />` in `App.jsx`, toasts in Step1+Step2 |

---

## Key API Response Shapes

### GET /api/courses
```json
{ "success": true, "data": { "courses": [ { "_id", "name", "code", "fee", "duration", "sort_order", "status" } ] } }
```

### GET /api/program-levels
```json
{ "success": true, "data": [ { "_id", "name", "duration", "fee", "time_slots": [], "sort_order", "status" } ] }
```

### GET /api/batches?course_id=X&level_id=Y
```json
{ "success": true, "data": { "batches": [ { "_id", "course_id": { "_id", "name", "code" }, "level_id", "batch_name", "start_date", "capacity", "seats_filled", "sort_order", "class_schedule", "status" } ] } }
```

### POST /api/registrations (multipart)
```json
{ "success": true, "data": { "student": { "id", "name", "mobile", "status" } }, "message": "Registration created..." }
```

### POST /api/registrations/:id/payment (multipart)
```json
{ "success": true, "data": { "student": { "id", "name", "status" }, "payment": { "id", "method", "amount", "trxid", "status" } }, "message": "Payment submitted..." }
```

---

## Client Data Extraction Patterns (Critical!)

| Endpoint | Axios Extraction | Notes |
|----------|-----------------|-------|
| GET /courses | `r.data.data.courses` | Wrapped in `data.courses` |
| GET /program-levels | `r.data.data` | Direct array in `data` |
| GET /batches | `r.data.data.batches` | Wrapped in `data.batches` |
| POST /registrations | `r.data.data?.student` | Student object in `data.student` |

---

## Server File Changes Summary

### Models
- **Course.js** — added `sort_order: { type: Number, default: 0 }`
- **ProgramLevel.js** — removed `course_id` field, added `sort_order`
- **Batch.js** — added `sort_order`
- **Student.js** — added `'prefer_not_to_say'` to gender enum

### Controllers
- **courseController.js** — `listCourses` sorts by `{ sort_order: 1, name: 1 }`
- **programLevelController.js** — standalone CRUD (no courseId param), sorts by `{ sort_order: 1, name: 1 }`
- **batchController.js** — added `level_id` filter support, sorts by `{ sort_order: 1, start_date: 1 }`
- **registrationController.js** — batch_id optional (only included if truthy), gender validation fixed
- **errorHandler.js** — handles Mongoose ValidationError, 11000 duplicate, CastError, Multer errors

### Routes
- **programLevel.js** — mounted at `/api/program-levels`, uses `PUT` (not PATCH)
- **server.js** — `/api/courses/:courseId/levels` → `/api/program-levels`

### Services
- **cloudinaryService.js** — added `image/gif` + `gif` to allowed formats

### Seed
- **seed.js** — 6 ProgramLevels independent (no course_id), 6 batches with course+level combos, sort_order on all

---

## Client File State (Key Files Only)

### RegistrationStep1.jsx
- Fetch courses: `api.get('/courses').then(r => r.data.data.courses || [])`
- Fetch levels: `api.get('/program-levels').then(r => r.data.data || [])` (independent)
- Fetch batches: `api.get('/batches?course_id=X&level_id=Y').then(r => r.data.data.batches || [])`
- Level dropdown: always enabled (not tied to course)
- Batch dropdown: optional (`z.string().optional().or(z.literal(''))`)
- Server error banner at form top (red, dismissible)
- Toast on success before navigating to Step2
- Photo upload hint: "JPG, PNG, WebP, GIF"

### RegistrationStep2.jsx
- Payment method: bKash/Nagad radio cards
- API: `POST /registrations/:id/payment` (multipart)
- Toast on success/error + inline error state

### CourseManagement.jsx
- **Tabs**: Courses | Program Levels
- Courses tab: course cards with fee, duration, sort_order, batch list (capacity bars), edit button
- Program Levels tab: level cards with fee, duration, time_slot chips, edit/delete buttons
- Add Batch modal: course select + level select (from standalone levels list) + sort_order
- All forms have Sort Order field
- API: batches fetched separately via `/api/batches` and grouped by course_id

### App.jsx
- Added `<Toaster position="bottom-center" />` with dark theme, green success / red error

### All fee displays
- Changed from `$` to `৳` (BDT Taka) across: RegistrationStep1, CourseManagement, StudentManagement, PaymentVerification, Dashboard, Overview, Reports

---

## Current Issues / Blockers
- (none known — full registration flow tested and working)

---

## What's Working
- Full registration flow: Landing → Step 1 (Course→Level→Batch) → Step 2 (Payment) → Confirmation
- Admin: Login, Overview, Student Mgmt, Payment Verification, Course/Level/Batch CRUD, Reports
- Student Dashboard with document lock/unlock
- Error handling: validation errors shown inline + server errors in banner + toast notifications
- BDT currency, sort_order ordering, GIF upload

---

## Next Steps (Priority Order)
1. **Phase 7: Deployment** (3 steps)
   - Add `vercel.json` for SPA routing
   - Set VITE_API_URL in Vercel env
   - Deploy & test all pages
2. **Student Login/Track** (Phase 1.2)
   - Simple mobile+trxid lookup page
3. **Meta/Facebook Integration** (Phase 8 — future)

---

## Development Commands

```bash
# Server
cd server
node server.js          # Start on port 5000
node utils/seed.js      # Re-seed database

# Client
cd client
npm run dev             # Dev server on port 3000
npm run build           # Production build

# Git
git add -A && git commit -m "message" && git push
```
