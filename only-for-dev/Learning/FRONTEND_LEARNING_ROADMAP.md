# Front-End Learning Roadmap (For FARS Project + Any React Project)

**Created:** 2026-08-02
**Audience:** Junior dev who knows React fundamentals, wants to (1) fully understand THIS project and (2) build any professional React app.

> Write in plain English / Banglish — no Bangla font.

---

## PART 1 — Everything you need to understand THIS project (FARS)

This project is your best textbook. It is a real, professional-grade codebase. Read these files **in this exact order** — each one teaches the next.

### Step 0 — Start here: entry point
| File | What it teaches |
|---|---|
| `client/index.html` | The HTML shell. Note `<div id="root">` — this is where React mounts everything. |
| `client/src/main.jsx` | THE entry point. See how `BrowserRouter`, `QueryClientProvider`, `AuthProvider` wrap the `<App/>`. This is the "provider stack" pattern. |
| `client/src/App.jsx` | All routes live here. See `/`, `/register/step1`, `/admin/*`, `/student/*`. This is **client-side routing**. |

**Understand:** The whole app is a tree: Providers → App → Routes → Pages → Components.

### Step 1 — The API layer (learn Axios properly)
| File | What it teaches |
|---|---|
| `client/src/services/api.js` | **Read this file 3 times.** It shows: axios instance, base URL from env, request interceptor (adds JWT token), response interceptor (catches 401 → logout). This is the single door every API call goes through. |

**Concepts to learn:** Axios interceptors, `import.meta.env` (Vite env vars), localStorage for tokens, why we centralize API calls.

### Step 2 — State that is shared everywhere (Context API)
| File | What it teaches |
|---|---|
| `client/src/context/AuthContext.jsx` | Context + Provider + custom hook pattern. `login()`, `logout()`, `user`, `token`. |
| `client/src/components/ProtectedRoute.jsx` | How to guard routes. Takes `role` prop, checks user role, redirects to login if not allowed. |

**Concepts to learn:** `createContext`, `useContext`, `useState` for auth state, `localStorage` persistence, wrapping app with provider, custom hook returning context value.

### Step 3 — Layout & shared UI components
| File | What it teaches |
|---|---|
| `client/src/layouts/AdminLayout.jsx` | Nested layout pattern — sidebar + header + `<Outlet/>`. All admin pages render inside this shell. |
| `client/src/components/ui/*` (Button, Input, Modal, Select, Badge, Card, Spinner, ProgressBar) | **Design system / reusable components pattern.** These are tiny, reusable building blocks. See how `Modal.jsx` takes `title`, `children`, `onClose`. |

**Concepts to learn:** children prop, props drilling, component composition, `<Outlet/>` from React Router, design tokens (bg-surface, text-on-surface from Tailwind theme).

### Step 4 — Data fetching done right (TanStack React Query) — MOST IMPORTANT
Open `client/src/pages/admin/CourseManagement.jsx`. This one file teaches 70% of the project.

| Pattern in file | Concept |
|---|---|
| `useQuery({ queryKey, queryFn })` | Fetching data + caching. `queryKey: ['courses']` = cache key. |
| `const courses = Array.isArray(coursesData) ? coursesData : [];` | Guarding against undefined/error data — always show safe empty fallback. |
| `useMutation({ mutationFn, onSuccess })` | Create/Update/Delete. `onSuccess` → `invalidateQueries` → UI auto-refreshes. |
| `queryClient.invalidateQueries({ queryKey: ['courses'] })` | After mutation, tell React Query "your cache is stale, refetch". |
| `const [x, setX] = useState()` returning `courseForm[1]` | Tuple state pattern (unusual but fine). |
| `useRef(false)` for `codeEdited` | Refs for values that must NOT trigger re-render. |
| `filteredCourses = courses.filter(...)` | Derived state — compute from existing state, don't store duplicates. |

**Concepts to learn:** `useQuery` vs `useMutation`, query keys, invalidateQueries, optimistic updates (later), isLoading/isError/isPending flags.

### Step 5 — Forms (React Hook Form + Zod)
Open `client/src/pages/public/RegistrationStep1.jsx`.

| Pattern in file | Concept |
|---|---|
| `useForm({ resolver: zodResolver(schema) })` | Form state management + validation. |
| `z.object({...})` schema | Define validation rules in one place. |
| `{...register('name')}` | Register inputs; RHF tracks value + errors automatically. |
| `errors.name.message` | Display validation errors. |
| `watch('mobile')` | Live value watching (for "Same as Mobile" checkbox). |
| `setValue('whatsapp', ...)` | Programmatically set a field. |
| Multi-step flow | Step1 → state passed to Step2 via router `state` or query params. |

**Concepts to learn:** register, handleSubmit, watch, setValue, zod schema, conditional validation, multi-step forms.

### Step 6 — Public vs Admin vs Student pages
| Folder | Pages | Teaches |
|---|---|---|
| `pages/public` | Landing, RegistrationStep1, RegistrationStep2, Confirmation, DraftSaved | Multi-step wizard, file upload, draft save/resume |
| `pages/admin` | Login, Overview, CourseManagement, StudentManagement, PaymentVerification, Reports, Settings | Full CRUD UIs, tables, drawers, charts, tabs |
| `pages/student` | Dashboard | Status-based UI, conditional rendering |

**Concepts to learn:** folder-by-role structure, CRUD page anatomy (list + modal form + delete confirm).

### Step 7 — Charts & polish
| File | Concept |
|---|---|
| `pages/admin/Overview.jsx` | Recharts (bar/pie/line), KPI cards |
| `pages/admin/Reports.jsx` | PDF/Excel export via server endpoints |
| `src/App.css`, `index.css` | Tailwind + theme tokens |

---

## PART 2 — Everything to learn to build/understand ANY React project

After the project, master these topics **in this order**. This is the professional checklist.

### Level A — Core React (you mostly have this)
1. JSX, components, props, children
2. `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`
3. Conditional rendering, lists + keys
4. Events, forms (controlled vs uncontrolled)
5. Lifting state up, prop drilling, and when to stop

### Level B — Ecosystem essentials (REQUIRED for any real job)
6. **React Router v6/v7** — routes, params, nested routes, Outlet, navigate, link, guards
7. **Axios / fetch** — interceptors, error handling, auth headers
8. **TanStack React Query** — useQuery, useMutation, caching, invalidate, pagination
9. **React Hook Form + Zod (or yup)** — forms + validation done properly
10. **Context API + custom hooks** — shared state, auth
11. **State management (choose one, don't learn all):** Zustand (easiest) or Redux Toolkit (industry standard). For THIS project: Context + React Query is enough.
12. **Tailwind CSS** (or CSS Modules/Styled Components) — utility-first styling

### Level C — Professional-grade skills
13. **Error boundaries** (`componentDidCatch` / `ErrorBoundary` class)
14. **Code splitting** — `React.lazy` + `Suspense`
15. **Custom hooks** — extracting reusable logic (e.g. `useAuth`, `useLocalStorage`)
16. **Performance** — memo, useMemo, useCallback, React DevTools profiler
17. **Testing** — Vitest/Jest + React Testing Library (unit), Playwright/Cypress (e2e)
18. **TypeScript** — the #1 skill employers want. Learn it even though FARS is JS.
19. **Environment config** — `.env`, `VITE_*` vars, dev/prod
20. **Accessibility** — semantic HTML, aria, focus management
21. **Security basics** — XSS, CSRF, token storage, never trust client input
22. **Git + code review** — branch workflow, PRs, commit messages

### Level D — Where data comes from
23. **REST APIs** — how Express/MongoDB serves data (read `server/` here too)
24. **Auth flows** — JWT, refresh tokens, protected routes
25. **File upload** — multer, Cloudinary (this project uses it)

---

## PART 3 — Best Architecture: how professionals organize a React app

This is the "professional folder structure" you asked about. FARS follows a simplified version of it — compare the two and you'll understand **why** each folder exists.

### The professional standard structure

```
src/
├── main.jsx              # Entry: providers + router + App
├── App.jsx               # Routes only
│
├── components/           # SHARED, dumb, reusable pieces (no business logic)
│   ├── ui/               # Button, Input, Modal, Card, Badge...
│   └── layout/           # Navbar, Sidebar, Footer, AdminLayout
│
├── pages/                # ONE folder per route (a page = a screen)
│   ├── Home/
│   │   ├── index.jsx     # the page
│   │   ├── HomePage.test.jsx
│   │   └── HomePage.module.css
│   └── Login/
│
├── features/             # (Modern approach) self-contained feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.js
│   │   └── AuthContext.jsx
│   └── courses/
│
├── hooks/                # Global reusable hooks (useLocalStorage, useDebounce)
├── context/              # Global providers (AuthContext, ThemeContext)
├── services/  (or api/)  # Axios instances, all HTTP calls, endpoint functions
├── utils/                # Pure helper functions (formatDate, validate)
├── constants/            # Fixed values (routes, enums, config)
├── assets/               # Images, fonts, static files
├── types/                # TypeScript types/interfaces
├── styles/               # Global CSS / theme
└── routes/               # Route config, route guards (if not in App.jsx)
```

### WHY each folder exists (the reasoning)

| Folder | What goes in | Why | Rule of thumb |
|---|---|---|---|
| `components/ui` | Button, Input, Modal, Badge | Reusable everywhere, never tied to a page | "If it has no business meaning, it goes here" |
| `components` | Navbar, Sidebar | Shared but bigger than atoms | "UI building blocks" |
| `pages` | One screen per route | Route ↔ folder 1:1, easy to navigate | "If it's a URL, it's a page" |
| `features` | Auth, Courses, Payments | Co-locate everything a feature needs | "Keep related code together" |
| `hooks` | useAuth, useDebounce | Extract repeatable logic, share across app | "Logic without JSX" |
| `context` | Global providers | Auth, theme, settings | "State shared by many components" |
| `services` | axios instance + API calls | One door for all HTTP | "Components never talk to axios directly" |
| `utils` | formatDate, currency | Pure functions, testable | "No side effects, no JSX" |
| `constants` | API_URL, ROLE_ENUM | Magic values in one place | "Never hardcode" |
| `assets` | images, fonts | Static files | "Non-code files" |
| `types` | TS interfaces | Contract of data shapes | "Document your data" |
| `routes` | Route definitions | Single source of routing truth | "Map URL → page + guard" |

### Architecture rules professionals follow

1. **Component isolation** — a component renders; it does NOT fetch data directly (unless it's a "container"). FARS mixes this (pages fetch) — fine for medium apps.
2. **Single responsibility** — one file, one job. If a component does 2 things, split it.
3. **Data flow one direction** — props down, events up.
4. **Never repeat** — if you copy-paste, extract it (component, hook, util, or api function).
5. **Co-location** — put related files near each other (tests, css, hooks beside component).
6. **Pages don't know about HTTP** — they call services. If API changes, only services change.
7. **Naming** — files PascalCase for components (`CourseManagement.jsx`), camelCase for hooks (`useAuth`), lowercase for services/utils (`api.js`).
8. **Keep it simple first** — don't add Redux or TypeScript until the app needs it. Add complexity only when it solves a real problem.

### FARS structure vs the professional standard (your homework)

```
FARS actual:                            Standard equivalent:
client/src/
├── App.jsx                              routes/ + App.jsx
├── main.jsx                             main.jsx
├── components/
│   ├── ProtectedRoute.jsx               components/ (route guard)
│   └── ui/*                             components/ui/*
├── context/AuthContext.jsx              context/ or features/auth/
├── layouts/AdminLayout.jsx              components/layout/
├── pages/
│   ├── admin/*                          pages/admin/* (fine)
│   ├── public/*                         pages/public/*
│   └── student/*                        pages/student/*
└── services/api.js                      services/api.js (matches!)
```

**Homework:** Take `CourseManagement.jsx` and mentally split it into:
- `components/ui/Modal.jsx` (already exists)
- `features/courses/CourseCard.jsx`
- `features/courses/CourseFormModal.jsx`
- `features/courses/api.js`
- `pages/admin/CourseManagement.jsx` (now only composes the above)

If you can do this split on paper, you understand professional React architecture.

---

## PART 4 — 30-day study plan (practical)

| Days | Topic | Practice on FARS |
|---|---|---|
| 1-2 | Read main.jsx, App.jsx, api.js | Trace a login request end-to-end |
| 3-5 | Hooks + React Query | Understand every line of CourseManagement.jsx |
| 6-8 | RHF + Zod | Rewrite the course form validation from scratch |
| 9-10 | Router + ProtectedRoute | Add a new admin page + guard it |
| 11-13 | Context + custom hooks | Move auth logic into `useAuth` hook |
| 14-15 | Extract UI components | Pull the modal into `components/ui` and reuse |
| 16-20 | TypeScript | Convert `api.js` + one page to `.tsx` |
| 21-23 | Testing | Write 2 tests for a util function + a component |
| 24-26 | Performance | memo/useMemo/useCallback + lazy load admin pages |
| 27-30 | Build a mini app | A todo/notes app using every pattern learned |

---

## Final advice

- **Read FARS before tutorials.** Every tutorial concept you learn, come back and find it in this codebase. Repetition = memory.
- **Don't learn everything.** React Query + RHF + Router + TypeScript covers 80% of real jobs.
- **When stuck:** open `only-for-dev/FARS_MASTER_CONTEXT.md` — it documents the whole project.
- **One page at a time.** Don't read all 14 pages. Master CourseManagement → RegistrationStep1 → AuthContext → then the rest is easy.

Good luck — this project is genuinely well-structured, so it's an excellent teacher.
