# MongoDB Handbook — Enterprise-Level Database Thinking

**Created:** 2026-08-02
**Audience:** Dev who knows MongoDB basics (collections, documents, find/insert), wants to design and operate databases for big, real projects.

> Plain English / Banglish — no Bangla font.
> Pairs with `BACKEND_PROFESSIONAL_HANDBOOK.md` and `BACKEND_LEARNING_ROADMAP.md`.

---

## Chapter 1 — First: Change How You Think About the Database

Most juniors think: *"my code writes to MongoDB, done."*
Professionals think of the database as **a product you design and operate** — the single most expensive thing to change later.

### The 3 professional questions (ask before writing any code)
1. **What are my read patterns?** — How will the app ask for data 10,000 times a day? (This drives the ENTIRE design.)
2. **What are my write patterns?** — How often, from where, in what volume? (This drives indexes + write concern.)
3. **How will this grow?** — 100 users → 1M users → 100M documents. What breaks?

### The MongoDB mindset shift (vs SQL thinking)
| SQL habit | MongoDB truth |
|---|---|
| Normalize everything | **Denormalize deliberately** — model for your queries, not for the "ideal" schema |
| Tables + strict columns | Flexible documents — shape is YOUR choice per read path |
| Joins are cheap-ish | Joins are **expensive** (`$lookup`) — design so you rarely need them |
| Migrations are schema changes | Migrations are **data** changes — the schema is flexible, the data isn't |
| Foreign keys | References are soft — NOT enforced. **You** must keep them valid |

**The #1 sentence to internalize:** In MongoDB you design the database *backwards* — you start from the questions the app asks, then shape the data so those questions are answered in one query.

---

## Chapter 2 — Data Modeling: The Professional Decision Framework

### 2.1 The core decision: Embed vs Reference (expanded)

| Factor | EMBED | REFERENCE |
|---|---|---|
| Size of child data | Small, bounded (items in an order, contact details) | Large or unbounded (comments, logs, messages) |
| Accessed with parent? | Almost always together | Sometimes separately |
| Updates together? | Both change in the same transaction | They change independently |
| Data growth | Stable | Grows forever |
| Example | Order + its line items | User + their orders; Post + its comments |

**The 3 rules professionals actually use:**
1. **Embed unless there's a reason not to** (start simple).
2. **Reference when data grows unboundedly** (don't bloat a document beyond ~16MB or beyond what fits a working set).
3. **Reference when you need independent updates** (updating a course name shouldn't rewrite 50,000 student docs).

### 2.2 The patterns you MUST know by name (senior interview material)

**a) One-to-one** → embed (profile + user) or same doc.

**b) One-to-many**
- Few children (a course has 3 batches) → **embed** as array of subdocs, OR reference.
- Many children (a blog post has 5000 comments) → **reference** in a separate collection.

**c) Many-to-many** (students ↔ courses)
- Option 1: reference arrays on both sides (fine when small).
- Option 2: **junction/edge collection** (enrollments: `{ student_id, course_id, enrolled_at, status }`) — this is where extra data (grade, date) lives. This is what pros choose when the relationship *has its own data*.

**d) The "bucket" pattern** — group related docs into fixed-size buckets (e.g., sensor readings per hour, messages per day). Reduces doc count, great for time-series + analytics.

**e) The "outlier" pattern** — store rare extra fields only on the few docs that need them (sparse). Avoids polluting all docs.

**f) The "computed/counter" pattern** — keep running counters on a parent (batch.seats_filled). Update atomically with `$inc`. FARS uses this — that's the pattern.

**g) The "attribute/indexed" pattern** — for unknown-in-advance attributes (product specs). Store as array of `{ k, v }` and index `arrayValues`.

### 2.3 Denormalization — the professional superpower (and danger)

**When to duplicate data on purpose:**
- A field read everywhere but changed rarely → duplicate the *display* value.
  - Example: order stores `{ product_id, product_name, product_price_at_purchase }`. If the product price changes later, old orders keep history. This is CORRECT.
- Saves an expensive `$lookup` on hot reads.

**The danger:** denormalized data can go stale. Mitigation:
- Only denormalize *snapshot* data (prices, names at time of action).
- For live data, keep the id + populate, OR update duplicates in the same transaction/queue.

### 2.4 Schema design checklist (print this)
```
□ For every query the app runs, can it be answered with ≤1-2 queries? If no → redesign or denormalize.
□ Are large/unbounded arrays avoided in hot documents?
□ Do all references point to existing docs (application-level integrity)?
□ Are documents < 16MB (and preferably < 4MB for hot docs)?
□ Would embedding have been simpler? (ask for every reference)
□ Is the schema future-proof: can it handle the growth you expect?
```

---

## Chapter 3 — Indexes: Where Senior Engineers Earn Their Money

### 3.1 The mental model
An index is a sorted lookup table MongoDB maintains. Without an index → **COLLSCAN** (reads every doc). With a good index → milliseconds.

**Rule:** index for your READ patterns — the WHERE and ORDER BY of your queries.

### 3.2 Index types (know all of these)
| Type | Used for |
|---|---|
| Single field | `{ email: 1 }` |
| **Compound** | `{ course_id: 1, status: 1 }` — multi-field queries |
| Unique | `{ trxid: 1 }, { unique: true }` — enforce invariants |
| Multikey | arrays (`tags`, `time_slots`) |
| **Text** | `{ name: 'text', description: 'text' }` — search |
| **Partial** | only index matching docs — `{ status: 1 }, { partialFilterExpression: { status: 'draft' } }` |
| Sparse | only docs that HAVE the field |
| **TTL** | auto-delete after X secs — `{ created_at: 1 }, { expireAfterSeconds: 3600 }` (sessions, OTPs) |
| Geospatial | `{ location: '2dsphere' }` |

### 3.3 Compound index rules (the exam questions)
1. **Equality first, then sort, then range.** Query `{ course_id: x, status: y }` sort `created_at` → index `{ course_id: 1, status: 1, created_at: 1 }`.
2. **ESR order:** Equality → Sort → Range. Get this right and you win.
3. One compound index can serve MANY queries (prefixes) — `{a,b,c}` serves `{a}`, `{a,b}`, `{a,b,c}`. Don't duplicate.
4. Sort direction matters only for multi-field sorts — mostly asc/desc works either way unless mixed.
5. **Index overhead:** each index slows writes + uses RAM. Don't over-index. Typical: 1-5 per collection.
6. **Check with `.explain('executionStats')`** — `COLLSCAN` vs `IXSCAN`, `nReturned` vs `totalDocsExamined`. If those differ, your index is wrong.

### 3.4 The 3 rules to remember forever
- Filter fields, then sort fields → index in that order.
- High-cardinality fields (mobile, trxid) → great indexes. Low-cardinality (`status`) → weak alone, useful second.
- If a query still scans → **the app is the problem, not MongoDB.** Redesign the query or schema.

---

## Chapter 4 — Reads, Writes & Consistency (How Data Really Moves)

### 4.1 Write concern — how safe is a write?
- `w: 0` — fire and forget (fast, can lose).
- `w: 1` — written to primary (default).
- `w: "majority"` — confirmed by majority of replica set (safe; required for important writes).

**Enterprise rule:** money/state changes → `w: "majority"`. Logs/tracking → `w: 1` is fine.

### 4.2 Read concern — how consistent is a read?
- `local` — may read uncommitted (fastest, default in some drivers).
- `majority` — only reads committed data (prevents reading rollback data).
- `linearizable` — strictest (single-read single-doc strongest).

### 4.3 Transactions (multi-document)
MongoDB supports multi-doc transactions (ACID) on replica sets since 4.0.

**When you MUST use a transaction:**
```
Transfer money: debit A + credit B            → 2 writes, atomic
Registration: create student + increment batch → FARS should use this!
```

**Pattern:**
```js
const session = await db.startSession();
try {
  session.startTransaction();
  await Student.create([...], { session });
  await Batch.updateOne(..., { session });
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
} finally { await session.endSession(); }
```

**Professional caution:** transactions are a tool, not a default. They cost performance and hold locks. Use them for multi-write integrity; don't wrap every single query.

### 4.4 Atomic operators (single-doc — your first choice)
You often DON'T need a transaction — one doc can do it:
- `$inc` — counters (FARS seats_filled) ✅
- `$push`, `$pull` — arrays
- `$set`, `$unset`
- `$addToSet` — array without dupes
- `findOneAndUpdate` with `$inc` — the classic "reserve a seat" pattern

### 4.5 Idempotency at the DB level
- Unique index on `trxid` → second insert with same trxid fails → 409. **The DB is the final guard.** (FARS does this.)

---

## Chapter 5 — Querying Like a Professional

### 5.1 Aggregation pipeline — your second superpower
`aggregate([...])` is a pipeline of stages. This is how you do JOINs, GROUP BYs, and reports — inside the DB, not in Node.

**Core stages:**
| Stage | What it does | FARS analogy |
|---|---|---|
| `$match` | filter (do this FIRST — reduces data early) | find status: 'pending' |
| `$group` | group + aggregate (`$sum`, `$avg`, `$count`) | revenue by month |
| `$lookup` | join with another collection | student → payments |
| `$unwind` | flatten arrays | time_slots |
| `$sort` / `$limit` / `$skip` | pagination | — |
| `$project` | shape output | pick fields |
| `$addFields` | computed fields | amount * 1.15 |
| `$facet` | multiple pipelines in one query | dashboard KPIs in one DB call |
| `$setWindowFields` | running totals / rank | — |

**Professional rules:**
1. `$match` as early as possible (minimize data through the pipeline).
2. Use indexes inside aggregation (`$match` on indexed fields first).
3. Prefer aggregation over pulling data to Node and computing there.
4. `$group` keys need indexes for big data.

### 5.2 Filter design details
- Use the exact field name types (number vs string bug).
- Regex on indexed text → use `$text` or prefix regex, not leading-wildcard `^.*` (kills index).
- `$in` with a list is better than OR-of-equality.
- Range on dates: always index `created_at`, and bound queries with `$gte/$lt`.

### 5.3 Pagination — offset vs cursor
- **Offset (`limit/skip`)**: fine for small sets, expensive for deep pages (skip is O(n)).
- **Cursor (keyset)**: `{ _id: { $lt: lastId } }` or `{ created_at: { $lt: last } }` with index. Instant deep pagination. Use for feeds/large lists.
- Always cap the max limit (e.g., 100).

---

## Chapter 6 — Schema/Model Design in Mongoose (Your Actual Code)

### 6.1 Professional schema conventions
```js
const orderSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: [...], default: 'pending', index: true },
  total: { type: Number, required: true },
  items: [{ productId: { type: ObjectId, ref: 'Product' }, qty: Number }],
  currency: { type: String, default: 'BDT' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
}, { timestamps: true, versionKey: false });
```

Rules:
- **Index in the schema** (`index: true`) — it's documentation + enforcement in one place.
- **`enum`** for every status/type — the DB validates your state machine.
- **`timestamps: true`** — get createdAt/updatedAt free (FARS uses it).
- **`select: false`** for sensitive fields (password_hash) — never returned by default.
- **`toJSON` transforms** — hide `__v`, `password_hash`, format `_id` → `id`.
- **Refs + populate** for relations; populate is the "join" but avoid it in hot paths.
- **`$** virtuals** for computed fields that shouldn't be stored.

### 6.2 Middleware (pre/post hooks) — where senior logic lives
- `pre('save')` — hash password before insert/update (FARS Admin does this).
- `pre('findOneAndUpdate')` — same for updates.
- `post('find')` — log queries, enrich results.
- **Warning:** business rules in middleware are easy to miss — prefer explicit service methods when you can. FARS uses a `pre` save for hashing — that's the right use.

### 6.3 Methods vs Statics vs Virtuals
- **methods** — per-document logic: `batch.isFull()` ✅ (FARS)
- **statics** — collection-level: `Order.findByStatus('paid')`, `PaymentConfig.getSingleton()` (FARS)
- **virtuals** — computed, not stored: `fullName`, `balance`.

---

## Chapter 7 — Operating a Real MongoDB (Production)

### 7.1 The deployment shapes
| Setup | When |
|---|---|
| **Managed (Atlas)** | DEFAULT for teams. Backups, monitoring, TLS, scaling in the UI. |
| **Replica set (self-hosted)** | Need more control. 3 nodes minimum (primary + 2). |
| **Sharded cluster** | Billions of docs, horizontal write scaling. LAST resort — hard to run. |

### 7.2 Replication & failover (know the concept)
- **Replica set** = primary (writes) + secondaries (copies). If primary dies → automatic election → new primary. Zero manual steps.
- Read from secondaries for analytics (read preference) — at the cost of eventual consistency.
- **Always use a replica set in production** — even a single Atlas "serverless/shared" gives you it. Never a lone standalone.

### 7.3 Sharding — when and how (know it even if you never do it)
- Shard key choice = the single most important performance decision (must spread writes evenly AND serve reads locally).
- Choose by your hottest query pattern, not randomly.
- **Hashed shard keys** distribute evenly but can't do range.
- **Practical advice:** you almost certainly don't need sharding. Index + schema + caching first. Revisit at ~100GB+ hot data or sustained write limits.

### 7.4 Backups — the "will I lose data?" answer
- Atlas: continuous cloud backups (point-in-time restore). ENABLE IT. **And test a restore** — untested backups don't count.
- Self-hosted: `mongodump` + oplog or filesystem snapshots.
- **RTO/RPO** — Recovery Time/Point Objectives. Define them (e.g., lose ≤ 5 min, restore within 1 hr) then engineer to meet them.

### 7.5 Monitoring & alerting
- Watch: **query latency (p95), index misses, connections, cache hit ratio, doc sizes, oplog window.**
- Set alerts on: long queries (>1s), high connection counts, replica lag, disk space.
- Atlas provides most dashboards; wire them to your alerting (email/Slack).

### 7.6 Security in production (non-negotiable)
```
□ Auth enabled (username/password) — NEVER a bare connection string
□ TLS/SSL in the connection string (mongodb+srv:// does this)
□ Restrict network access (allow only app server IPs / VPC peering)
□ Separate credentials per environment (dev/stage/prod)
□ Least-privilege DB users (app user ≠ admin user)
□ Encrypt secrets; never in repo (FARS uses .env — good)
□ Enable auditing (who did what, when)
□ Rotate credentials on team changes
□ Test your restore from a DIFFERENT machine
```

---

## Chapter 8 — Performance Troubleshooting (The Pro's Flow)

### When a query is slow — do this in order:
1. **`explain('executionStats')`** → `IXSCAN` or `COLLSCAN`? If COLLSCAN → index.
2. **Check `totalDocsExamined` vs `nReturned`** → if hugely different, index is wrong/partial.
3. **Look at the filter** — is a field compared as string vs number? Regex leading wildcard?
4. **Is it in a loop (N+1)?** → one `$lookup`/populate/`$in` instead.
5. **Sort fields** — are they in the index (ESR)?
6. **Payload size** — `.select()` only what's needed; compress large strings; cap limits.
7. **Working set** — does hot data fit in RAM? If it pages to disk, no index fixes it (that's a capacity/schema problem).
8. **Lock contention** — long-running transactions / heavy writes on the same docs. Break into batches.

### Profiling
- `db.setProfilingLevel(1, { slowms: 200 })` → logs slow ops to `system.profile`. Find your real worst offenders with data, not guesses.

---

## Chapter 9 — Migrations & Schema Evolution

MongoDB has no enforced schema → **migration discipline is ON YOU** (this is where teams fail).

### The professional approach
1. **Never change the shape without a plan.** Old + new code often run together during deploys.
2. **Forward-compatible writes:** when you add a field, write code that handles both old docs (missing field) and new docs. Defaults + `$ifNull` + `??` in queries.
3. **Backfill jobs:** a script that runs `updateMany` to fill new fields / transform old data — scheduled, logged, idempotent, tested on a copy.
4. **Version your documents:** add `schemaVersion: 1`; when it changes, migrate lazily on read or eagerly via job.
5. **Dual-write during big changes** (write old + new shape) then switch read, then drop old.

### Migration tools (know they exist)
- **mongodb-migrate** / **migrate-mongo** — versioned migration files like SQL's.
- Or a simple `jobs/` folder of idempotent scripts you run in order.

---

## Chapter 10 — Caching & Hot Reads (The Scaling Layer)

The 3-tier performance model:
```
DB (authoritative)  ←  Cache (Redis/Memory)  ←  CDN (static/geo)
```

### Cache strategy (cache-aside — the standard)
1. Read → check cache. Hit → return.
2. Miss → read DB → write cache with TTL → return.
3. Write → update DB → **invalidate** cache (don't try to update cache).

### What to cache (choose by read/write ratio)
- Config/settings (PaymentConfig — FARS reads this on every payment page!)
- Popular lists (categories — FARS reads categories everywhere)
- Auth sessions / rate counters
- Expensive aggregations (dashboard KPIs, computed weekly)

### Rules
- TTL everything (config 1h, lists 5min, sessions longer).
- Never cache user-private data without per-user keys.
- Invalidate on write, or use TTL as the safety net.
- Redis is the industry standard; **know the 5 data types** (string, list, hash, set, zset).

---

## Chapter 11 — MongoDB in a Microservices/Team World

### 11.1 Database-per-service
In microservices, each service owns its DB. Others must NOT touch it directly — they call APIs or consume events. MongoDB fits this well (each service models its own data).

### 11.2 Distributed data problems (the hard part)
- **No cross-service transactions.** Patterns: saga (compensating actions), outbox pattern (write DB + outbox event atomically, worker publishes), idempotency keys.
- **The Outbox pattern** (senior skill): your transactional writes also write an "outbox" collection in the SAME transaction; a worker reads the outbox and publishes events. Guarantees no lost events.

### 11.3 Eventual consistency mindset
- Across services, data is eventually consistent. Accept it; design UIs/APIs that tolerate it.
- Show "pending", use optimistic updates, reconcile with jobs.

---

## Chapter 12 — The Complete Database Design Workflow (Do This Every Project)

```
Step 1: LIST THE USE-CASES
        Register student, pay, verify payment, admit, generate report...
Step 2: FOR EACH USE-CASE, WRITE THE QUERIES
        "find student by mobile", "list payments for student", "count pending by month"
Step 3: GROUP QUERIES BY READ PATTERN → DESIGN COLLECTIONS
        What's read together → same doc or populate path
Step 4: CHOOSE EMBED vs REFERENCE for each relationship
        (Ch.2 rules)
Step 5: DESIGN INDEXES FROM THE QUERIES
        filter+sort → compound (ESR); unique for invariants; TTL for expiry
Step 6: DESIGN FOR WRITE PATTERNS
        $inc for counters, transactions for multi-write, idempotency for retries
Step 7: DRAW THE DIAGRAM & WRITE THE MIGRATION PLAN
        Every team member reviews; get sign-off BEFORE building
Step 8: BUILD + MEASURE
        explain() every hot query; profile slow ops; revisit step 5
```

**The senior habit:** Step 1-7 take 60% of the time. Code is the easy 40%. Database design is where decisions compound (or cost) forever.

---

## Chapter 13 — What to Learn Next (Concrete Path)

### Level 1 — Solidify the engine (this handbook covers these)
- Embed vs reference, patterns (Ch.2)
- Indexes, compound/ESR, explain() (Ch.3)
- Aggregation pipeline (Ch.5)
- Mongoose methods/statics/middleware (Ch.6)

### Level 2 — Practice (build these, with real data volume)
1. E-commerce: products, carts, orders, inventory counters, monthly revenue aggregation, order state machine, idempotent checkout.
2. Booking: slots, double-booking prevention (transaction), TTL expiry for holds, cursor pagination.
3. Chat/notifications: unbounded growth → reference + bucket + TTL; read receipts.
4. Analytics dashboard: `$facet`, precomputed aggregates, cache layer.

### Level 3 — Deepen
- **Atlas certification / official course** (free) — official terminology + best practices.
- Read the **MongoDB University course M320: Data Modeling** (the definitive modeling course).
- **Aggregation pipeline mastery** — you'll write `$lookup/$group/$facet` for everything.
- **Transactions** — build a wallet with transfers + rollback.
- **Index strategies** in depth + `explain` fluency.

### Level 4 — Operate
- Set up a replica set locally (Docker: 3 mongod + 1 arbiter). Fail a node. Watch election.
- Configure Atlas: auth, IP allowlist, backups, point-in-time restore — and RESTORE into a test DB.
- Build monitoring: Atlas metrics + alert on slow query.
- Migration practice: change a schema shape on live-ish data with a backfill job.

---

## Final Advice

- **Model for queries, not for "database purity."** MongoDB rewards the app's read patterns; the "ideal normalized schema" is often the wrong answer here.
- **Indexes are the difference between a demo and a product.** Master ESR + explain().
- **Every write that touches 2+ collections and matters = transaction or idempotency key.** Never guess.
- **Denormalize for reads, but keep snapshots (not live refs) when you do.**
- **Design backward, operate like it's production on day 1** — backups, monitoring, auth, least-privilege.
- This handbook + FARS's `Batch`, `Student`, `Payment`, `CourseCategory` models + seed script give you a working reference for nearly every pattern here.

Good luck — when you can design the schema (not just the code) for a booking app, an e-commerce cart, and a wallet without breaking a sweat, you're enterprise-level with MongoDB.
