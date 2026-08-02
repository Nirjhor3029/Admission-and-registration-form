# MongoDB Study Guide

This file is a simple, structured learning note for MongoDB. You can read it from the workspace anytime without needing the terminal.

---

## 1. MongoDB er basic idea

MongoDB ekta NoSQL database.

- Database: collection gulo rakhar container
- Collection: table er moto
- Document: row/record er moto
- Field: key-value pair

Example document:

```json
{
  "name": "Rafi",
  "age": 21,
  "course": "Computer Science"
}
```

---

## 2. CRUD basics

### Create

```javascript
db.students.insertOne({
  name: "Rafi",
  age: 21,
  course: "Computer Science"
})
```

```javascript
db.students.insertMany([
  { name: "Nadia", age: 20, course: "Engineering" },
  { name: "Siam", age: 22, course: "Business" }
])
```

### Read

```javascript
db.students.find()
```

```javascript
db.students.findOne({ name: "Rafi" })
```

### Update

```javascript
db.students.updateOne(
  { name: "Rafi" },
  { $set: { age: 22 } }
)
```

### Delete

```javascript
db.students.deleteOne({ name: "Rafi" })
```

---

## 3. Querying

### Equal condition

```javascript
db.students.find({ course: "Computer Science" })
```

### Comparison operators

```javascript
db.students.find({ age: { $gte: 20, $lte: 25 } })
```

Common operators:
- $eq
- $gt
- $gte
- $lt
- $lte
- $ne

---

## 4. Sorting, limit, skip

### Sort

```javascript
db.students.find().sort({ age: 1 })
```

### Limit

```javascript
db.students.find().limit(5)
```

### Skip

```javascript
db.students.find().skip(10).limit(5)
```

---

## 5. Projection

Projection means only specific fields dekhano.

```javascript
db.students.find({}, { name: 1, course: 1, _id: 0 })
```

---

## 6. Embedded documents

```javascript
db.students.insertOne({
  name: "Rafi",
  address: {
    city: "Dhaka",
    country: "Bangladesh"
  }
})
```

---

## 7. Arrays

```javascript
db.students.insertOne({
  name: "Nadia",
  hobbies: ["reading", "traveling", "coding"]
})
```

---

## 8. Data modeling basics

### Embed vs Reference

- Embed: data choto and usually together thakle
- Reference: data boro or separate access korte chaole

Example:
- Student er address embed kora jete pare
- Student er orders reference kora jete pare

---

## 9. Indexes

Index query gulo faster kore.

```javascript
db.students.createIndex({ name: 1 })
```

Indexes important because without it MongoDB scanning korbe entire collection.

---

## 10. Aggregation basics

Aggregation pipeline data process kore.

```javascript
db.students.aggregate([
  { $group: { _id: "$course", total: { $sum: 1 } } }
])
```

Common stages:
- $match
- $group
- $sort
- $project
- $lookup

---

## 11. Transactions

Transactions multiple operations er jonno useful.

Example: money transfer er somoy debit + credit atomic hote pare.

---

## 12. Best practices

- Query er jonno index use koro
- Large data ke unnecessary vabe embed koro na
- Read pattern er upor data model design koro
- Backup, auth, monitoring production e important

---

## 13. Quick revision checklist

- Database, collection, document ki?
- CRUD basics ki?
- find(), findOne(), updateOne(), deleteOne() ki?
- Indexes ki?
- Aggregation pipeline er basic idea ki?

---

## 14. Next steps

Age pore shikhte paro:
- Mongoose
- Schema design
- Compound indexes
- Aggregation with $lookup
- Transactions
- Production best practices

---

## 15. Helpful reference

Workspace e already ache:
- [MONGODB_ENTERPRISE_HANDBOOK.md](MONGODB_ENTERPRISE_HANDBOOK.md)
