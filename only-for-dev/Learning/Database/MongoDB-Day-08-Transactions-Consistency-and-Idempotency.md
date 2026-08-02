# MongoDB Day 8 — Transactions, Consistency, and Idempotency

This day focuses on correctness and reliability.

## 1. Why transactions matter

Transactions are needed when multiple writes must succeed together or fail together.

Example:
- debit one account
- credit another account
- both must happen together

## 2. Transaction pattern

```javascript
const session = await mongoose.startSession();

try {
  session.startTransaction();
  await Student.create([{ name: 'Rafi' }], { session });
  await Batch.updateOne({ _id: batchId }, { $inc: { seatsFilled: 1 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
```

## 3. Atomic operators

For single-document updates, you often do not need full transactions.

Useful operators:
- `$inc`
- `$set`
- `$push`
- `$pull`
- `$addToSet`

## 4. Idempotency

If a request is retried, the database should not create duplicates or corrupt state.

A common pattern is a unique `trxId`.

```javascript
// unique index on trxId
```

## 5. Consistency concepts

- write concern: how safely a write is acknowledged
- read concern: how consistent a read is
- replica sets: replication and failover

## 6. Enterprise rule

For money, registration, or state-changing flows, use transactions or strong idempotency guarantees.

## 7. Practice

Design a flow for:
- student registration
- payment verification
- seat reservation

Ask:
- which steps must be atomic?
- what happens if the user retries?

## 8. Study goal for Day 8

Understand:
- transactions
- atomic updates
- idempotency
- safe write patterns
