# MongoDB Day 2 — CRUD and Queries

Today we will learn how to create, read, update, and delete data.

## 1. CRUD ki?

CRUD = Create, Read, Update, Delete.

## 2. Create

Insert one document:

```javascript
db.students.insertOne({
  name: "Rafi",
  age: 21,
  course: "Computer Science"
})
```

Insert many documents:

```javascript
db.students.insertMany([
  { name: "Nadia", age: 20, course: "Engineering" },
  { name: "Siam", age: 22, course: "Business" }
])
```

## 3. Read

Find all documents:

```javascript
db.students.find()
```

Find one document:

```javascript
db.students.findOne({ name: "Rafi" })
```

## 4. Update

```javascript
db.students.updateOne(
  { name: "Rafi" },
  { $set: { age: 22 } }
)
```

## 5. Delete

```javascript
db.students.deleteOne({ name: "Rafi" })
```

## 6. Querying with conditions

```javascript
db.students.find({ course: "Computer Science" })
```

## 7. Comparison operators

```javascript
db.students.find({ age: { $gte: 20, $lte: 25 } })
```

Useful operators:
- $eq
- $gt
- $gte
- $lt
- $lte
- $ne

## 8. Sorting, limit, skip

Sort:

```javascript
db.students.find().sort({ age: 1 })
```

Limit:

```javascript
db.students.find().limit(5)
```

Skip:

```javascript
db.students.find().skip(10).limit(5)
```

## 9. Practice

Try to do these steps:
1. ekta student insert koro
2. sob student dekhte jacho
3. ekta student er age update koro
4. ekta student delete koro

## 10. Study goal for Day 2

Shikhte hobe:
- insert, find, update, delete
- query conditions
- sort, limit, skip
