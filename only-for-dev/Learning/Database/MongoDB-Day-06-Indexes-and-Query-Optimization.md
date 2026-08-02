# MongoDB Day 6 — Indexes and Query Optimization

This is one of the most important skills for building high-performance databases.

## 1. Why indexes matter

Without an index, MongoDB may scan the whole collection. That is slow.

With an index, MongoDB can jump directly to the relevant documents.

## 2. Basic index

```javascript
db.students.createIndex({ email: 1 })
```

## 3. Compound index

For queries that use multiple fields, use a compound index.

```javascript
db.enrollments.createIndex({ studentId: 1, status: 1, createdAt: 1 })
```

## 4. ESR rule

The professional rule is:

Equality -> Sort -> Range

Example:
- filter by studentId
- sort by createdAt
- range by status or date

## 5. Index types you should know

- single-field index
- compound index
- unique index
- partial index
- text index
- TTL index
- geospatial index

## 6. How to know if your query is good

Use `explain()`.

```javascript
db.students.find({ email: 'rafi@example.com' }).explain('executionStats')
```

Look for:
- `COLLSCAN` vs `IXSCAN`
- `totalDocsExamined`
- `nReturned`

## 7. Common mistakes

- indexing too many fields
- using low-cardinality fields alone
- ignoring query patterns
- building indexes without measuring

## 8. Enterprise advice

For large systems:
- index for read patterns
- keep indexes lean
- test on real data volume

## 9. Practice

Think about a student registration system.

Which queries will be frequent?
- find by mobile
- find by course and status
- sort by created date
- find pending payments

These queries should drive the index design.

## 10. Study goal for Day 6

Understand:
- why indexes exist
- compound indexes
- ESR rule
- explain() for performance debugging
