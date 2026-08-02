# MongoDB Day 4 — Aggregation and Best Practices

Today we will learn how MongoDB can group and analyze data.

## 1. Aggregation ki?

Aggregation pipeline data process kore. It helps with reports, summaries, and joins.

## 2. Simple aggregation example

```javascript
db.students.aggregate([
  { $group: { _id: "$course", total: { $sum: 1 } } }
])
```

Ei query course wise student count dekhay.

## 3. Common aggregation stages

- $match: filter kora
- $group: grouping kora
- $sort: sort kora
- $project: field select kora
- $lookup: join er moto

## 4. Transactions

Transactions multiple operations er jonno use kora hoy.

Example:
- money transfer
- debit + credit er jonno atomic operation

## 5. Best practices

- read pattern er upor data model design koro
- unnecessary embedded data use na koro
- frequent query er jonno index add koro
- production e backup, auth, monitoring rakho

## 6. Mini revision quiz

1. CRUD er full form ki?
2. insertOne() use korte ki korte paro?
3. index ki?
4. aggregation er purpose ki?
5. embed vs reference er difference ki?

## 7. Study goal for Day 4

Shikhte hobe:
- aggregation basics
- transactions er idea
- production best practices

## 8. Next step

Next you can learn Mongoose and schema design.
