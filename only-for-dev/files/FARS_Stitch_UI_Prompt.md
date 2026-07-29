# Stitch UI Prompt — Facebook Admission & Registration System (FARS)
*(Paste this into Google Stitch to generate the UI screens)*

---

Design a modern, professional, trustworthy web application UI for a **student admission & registration platform** called **FARS**, used by a coaching center in Bangladesh whose students arrive mostly from Facebook ads. The audience is students (often on mobile, inside the Facebook in-app browser) and admin staff (on desktop).

**Design style:** Clean, professional, education-tech aesthetic — trustworthy and calm (this involves payments, so avoid anything that looks "salesy" or cluttered). Rounded cards, generous white space, soft shadows, a confident primary brand color (deep blue or teal) with a warm accent color (orange/gold) for CTAs. Clear typography hierarchy, mobile-first for student-facing screens, data-dense but organized for admin screens.

Generate the following screens:

### Student-Facing (mobile-first, must look great in a narrow viewport)
1. **Landing Page** — hero section introducing the course/institute, trust badges, prominent "Apply Now" CTA button, course highlights section, testimonials placeholder, footer.
2. **Registration Form (Step 1: Personal & Course Info)** — a clean multi-step form: Full Name, Mobile Number, Email, WhatsApp Number, Gender (select), Photo upload (with preview), Educational Qualification, Course (dropdown), Batch (dropdown), Referral Source (dropdown), Address (textarea). Progress indicator at top (Step 1 of 2).
3. **Payment Page (Step 2)** — bKash/Nagad selectable payment method cards with logos, merchant number displayed prominently, fields for Amount Paid, Transaction ID, Payment Date, Screenshot upload with drag-and-drop area, "Submit Registration" CTA.
4. **Confirmation Screen** — success illustration/icon, confirmation message, summary of submitted info, "We'll contact you via Phone/WhatsApp/Email" note, button to go to Student Dashboard/Login.
5. **Student Dashboard** — status badge (Pending / Under Review / Verified / Admitted, color-coded), cards for Payment History, Invoice download, Admission Letter download, Student ID card preview, Class Schedule, Course Materials list, Certificate download (locked until complete).

### Admin-Facing (desktop, data-dense, sidebar navigation layout)
6. **Admin Login** — simple centered card, email/password, brand logo.
7. **Admin Dashboard (Overview)** — top stat cards (Total Leads, Pending Payments, Admitted Students, Revenue This Month), admission funnel chart, revenue trend line chart, course-wise pie chart, recent activity feed.
8. **Student Management Table** — sortable/filterable table (Name, Mobile, Course, Batch, Status badge, Payment Method, Amount, Date), search bar, status filter chips, row-click opens a detail drawer showing full profile + payment screenshot preview + Verify/Reject buttons.
9. **Payment Verification View** — split view: submitted TrxID + Amount + Date on one side, uploaded payment screenshot zoomed on the other, Approve/Reject buttons with a reason field for rejection.
10. **Course & Batch Management** — card grid of courses with batch sub-lists, capacity/seats-filled progress bars, Add/Edit modals.
11. **Reports Page** — date range picker, report type tabs (Admission / Payment / Income / Student), data table with Export to Excel / Export to PDF buttons, chart preview above the table.

**Color/Status conventions to use consistently:** Pending = gray/yellow, Payment Under Review = amber, Payment Verified = blue, Admitted = green, Rejected/Cancelled = red.

Keep the component library consistent across all screens (same button styles, same card radius, same input styles) so it feels like one cohesive product, not disconnected mockups.
