# SARS Project Structure

> **This file is the source of truth for the project structure.**
> When you add/remove files, update the tree blocks below, then run the
> generator to refresh the PDF: `node .tools/gen-structure-pdf.js`
> Output: `SARS-Project-Structure.pdf`.

## Server — Backend (Express + MongoDB)

```
server/
|-- server.js                entry point - mounts all /api routes, CORS, helmet, rate-limits
|-- .env / .env.example      environment config (+ example)
|-- .gitignore  vercel.json  package.json  package-lock.json  README.md
|-- config/
|    `-- db.js               MongoDB connection
|-- models/                  10 Mongoose schemas
|    |-- Admin.js  Application.js  AuditLog.js  Batch.js
|    `-- Course.js  CourseCategory.js  Payment.js  PaymentConfig.js
|        ProgramLevel.js  Student.js
|-- controllers/             11 resource controllers (business logic)
|    |-- adminController.js  applicationController.js  authController.js
|    |-- batchController.js  courseCategoryController.js  courseController.js
|    |-- paymentConfigController.js  programLevelController.js
|    |-- registrationController.js  reportController.js
|    `-- studentDashboardController.js
|-- routes/                  12 Express routers
|    |-- admin.js  application.js  auth.js  batch.js  course.js
|    |-- courseCategory.js  lead.js  paymentConfig.js  programLevel.js
|    `-- registration.js  report.js  studentDashboard.js
|-- middlewares/
|    |-- auth.js             JWT authentication + role authorization
|    `-- errorHandler.js
|-- services/                7 integrations
|    |-- authService.js  cloudinaryService.js  emailService.js
|    |-- pdfService.js  smsService.js
|    `-- whatsappService.js
`-- utils/
     |-- AppError.js         custom API error
     `-- seed.js             seed script (dev)
```

## Client — Frontend (React + Vite + Tailwind)

```
client/
|-- index.html               root HTML - title, fonts, Material Symbols
|-- vite.config.js           dev server (port 3000)
|-- tailwind.config.js       design tokens (colors, typography)
|-- package.json  package-lock.json  README.md
|-- public/
|    |-- favicon.svg  icons.svg
`-- src/
     |-- main.jsx            React entry point
     |-- App.jsx             all routes
     |-- index.css           global styles
     |-- assets/             hero.png  react.svg  vite.svg
     |-- components/
     |    |-- ProtectedRoute.jsx
     |    `-- ui/            9 primitives: Badge, Button, Card, ConfirmDialog,
     |                        Input, Modal, ProgressBar, Select, Spinner
     |-- context/
     |    `-- AuthContext.jsx
     |-- layouts/
     |    `-- AdminLayout.jsx
     |-- pages/
     |    |-- admin/         7: CourseManagement, Login, Overview, PaymentVerification,
     |    |                   Reports, Settings, StudentManagement
     |    |-- public/        6: Confirmation, DraftSaved, Landing, RegistrationStep1,
     |    |                        RegistrationStep2, StudentLogin
     |    `-- student/       1: Dashboard
     `-- services/
          `-- api.js         axios instance + authenticated blob download helper
```

_Generated from the live repo. Update this file as the project evolves._