# FARS - Server (Backend API)

Facebook Admission & Registration System - Backend REST API.

## Tech Stack

Node.js + Express.js + MongoDB (Mongoose) + JWT Auth

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your values (MongoDB URI, JWT secret, Cloudinary keys, etc.)

# Start development server
npm run dev

# Seed database with sample data
npm run seed
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_*` | Cloudinary file upload credentials |
| `SMTP_*` | Email (Nodemailer) configuration |

## API Endpoints

### Auth
- `POST /api/auth/admin/login` — Admin login
- `POST /api/auth/student/login` — Student login

### Public
- `POST /api/registrations` — Create registration
- `POST /api/registrations/:id/payment` — Submit payment

### Admin (requires JWT)
- `GET /api/students` — List students (paginated, filterable)
- `GET /api/students/:id` — Student detail
- `PATCH /api/students/:id/status` — Update status
- `PATCH /api/students/:id/payment/verify` — Verify payment
- `PATCH /api/students/:id/payment/reject` — Reject payment
- `GET /api/admin/stats` — Dashboard stats
- `GET/POST/PATCH/DELETE /api/courses` — Course CRUD
- `GET/POST/PATCH /api/batches` — Batch CRUD
- `GET /api/reports/admissions` — Admission report
- `GET /api/reports/payments` — Payment report
- `GET /api/reports/export` — Export Excel/PDF

### Student (requires JWT)
- `GET /api/student/dashboard` — Student dashboard
- `GET /api/student/invoice` — Download invoice PDF
- `GET /api/student/admission-letter` — Download admission letter PDF
- `GET /api/student/materials` — View course materials
- `GET /api/student/certificate` — Download certificate PDF

## Deploy to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

The `vercel.json` automatically routes all traffic to `server.js`.
