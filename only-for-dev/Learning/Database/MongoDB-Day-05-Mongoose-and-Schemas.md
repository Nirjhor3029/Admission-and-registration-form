# MongoDB Day 5 — Mongoose and Professional Schemas

This day is about moving from raw MongoDB to real application-level database design.

## 1. Professional mindset

Before writing any schema, ask:

1. What data will be read most often?
2. What data will be written most often?
3. How will this grow over time?

Professional engineers design for query patterns, not for ideal database theory alone.

## 2. Mongoose basics

Mongoose helps you define schema and enforce rules in your Node.js app.

```javascript
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
```

## 3. Schema conventions used by professionals

- `required: true` for important fields
- `enum` for fixed states
- `timestamps: true` for created/updated time
- `select: false` for sensitive fields like password hashes
- `index: true` for fields used in filtering and lookup

## 4. Methods, statics, and middleware

### Methods
Per-document logic:

```javascript
studentSchema.methods.isActive = function () {
  return this.status === 'active';
};
```

### Statics
Collection-level logic:

```javascript
studentSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};
```

### Middleware
Useful for hooks like password hashing or logging:

```javascript
studentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
```

## 5. Embed vs reference in real apps

### Embed
Use when the child data is small and usually read with the parent.

### Reference
Use when the child data grows large or changes independently.

Example:
- student address -> embed
- student orders -> reference

## 6. Enterprise rule

Do not blindly normalize everything. Design for the app's read pattern and future growth.

## 7. Practice

Design a schema for:
- student
- course
- enrollment
- payment

Ask yourself:
- which fields belong inside the main document?
- which fields should be in separate collections?

## 8. Study goal for Day 5

Understand:
- Mongoose schema design
- schema conventions
- embed vs reference in real app context
