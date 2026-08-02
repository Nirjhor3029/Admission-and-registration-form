# MongoDB Day 12 — Performance Tuning and Caching

Performance engineering is where great database engineers stand out.

## 1. Why performance tuning matters

A database may work in development but fail under real traffic.

The main performance levers are:
- indexes
- query design
- schema structure
- caching
- hardware and memory

## 2. Query tuning process

When a query is slow, check:
1. whether it uses an index
2. whether it scans too many documents
3. whether the filter is selective enough
4. whether the result size is too large
5. whether the app is making too many queries

## 3. Explain and measure

Use `explain()` and understand:
- `COLLSCAN`
- `IXSCAN`
- `totalDocsExamined`
- `nReturned`

## 4. Caching strategy

A common strategy is cache-aside:
1. check cache
2. if miss, read DB
3. store result with TTL
4. invalidate on write

## 5. What to cache

Good candidates:
- configuration data
- categories and lookup tables
- frequent read-only summaries
- dashboard metrics

## 6. Important warning

Do not cache private user data without careful key design.

## 7. Study goal for Day 12

Learn how to diagnose performance issues and improve them using indexes, query design, and caching.
