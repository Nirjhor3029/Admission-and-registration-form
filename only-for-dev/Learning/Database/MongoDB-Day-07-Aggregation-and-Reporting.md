# MongoDB Day 7 — Aggregation and Reporting

Aggregation is how MongoDB handles analysis, reporting, and complex data processing inside the database.

## 1. Why aggregation matters

Instead of pulling lots of data into Node.js and processing it there, MongoDB can do the work itself.

That is faster and cleaner for many reporting use cases.

## 2. Core aggregation stages

### $match
Filter data early.

```javascript
db.students.aggregate([
  { $match: { status: 'active' } }
])
```

### $group
Group and calculate values.

```javascript
db.students.aggregate([
  { $group: { _id: '$course', totalStudents: { $sum: 1 } } }
])
```

### $sort
Sort results.

```javascript
db.students.aggregate([
  { $sort: { age: -1 } }
])
```

### $project
Select and shape fields.

```javascript
db.students.aggregate([
  { $project: { _id: 0, name: 1, course: 1 } }
])
```

### $lookup
Join-like behavior with another collection.

```javascript
db.students.aggregate([
  {
    $lookup: {
      from: 'payments',
      localField: '_id',
      foreignField: 'studentId',
      as: 'payments'
    }
  }
])
```

## 3. Reporting example

A dashboard may need:
- total users
- total revenue
- pending payments
- active enrollments

Aggregation is perfect for this.

## 4. Enterprise advice

- put `$match` early
- index fields used inside `$match`
- use aggregation for reporting, not for every simple query
- for very large datasets, precompute important summaries

## 5. Practice

Build an aggregation that shows:
- total students by course
- total payments by month
- active students count

## 6. Study goal for Day 7

Understand:
- aggregation stages
- grouping and reporting
- lookup and report design
