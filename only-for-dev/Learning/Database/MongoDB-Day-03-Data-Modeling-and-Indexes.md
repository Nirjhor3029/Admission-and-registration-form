# MongoDB Day 3 — Data Modeling and Indexes

Today we will learn how data should be structured and how queries can be made faster.

## 1. Embedded vs Reference

### Embedded
Data choto and usually together thakle embed kora jaye.

```javascript
db.students.insertOne({
  name: "Rafi",
  address: {
    city: "Dhaka",
    country: "Bangladesh"
  }
})
```

### Reference
Data boro, separate access korte hole reference use kora jaye.

Example:
- student er orders separate collection e thakte pare

## 2. Arrays

```javascript
db.students.insertOne({
  name: "Nadia",
  hobbies: ["reading", "traveling", "coding"]
})
```

## 3. Why data modeling matters

MongoDB e schema design er upor performance depend kore.

Good design means:
- easy reads
- less duplication
- scalable growth

## 4. Indexes

Index query gulo faster kore.

```javascript
db.students.createIndex({ name: 1 })
```

Without index, MongoDB may scan the whole collection.

## 5. Common rule

- frequent query er field e index use koro
- but over-indexing korle write operation slow hote pare

## 6. Practice

Think about these questions:
- student er address embed hobe na reference?
- student er orders kothay thakbe?
- kon field e index add kora jete pare?

## 7. Study goal for Day 3

Shikhte hobe:
- embed vs reference
- arrays
- indexes er basic idea
