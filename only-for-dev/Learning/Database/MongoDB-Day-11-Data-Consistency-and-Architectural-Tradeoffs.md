# MongoDB Day 11 — Data Consistency and Architectural Tradeoffs

This day teaches you how professionals choose between speed, correctness, and complexity.

## 1. Consistency is a tradeoff

In distributed systems, you often need to choose between:
- strong consistency
- eventual consistency
- higher availability

## 2. When to use transactions

Use transactions when multiple writes are tied together and must be atomic.

Examples:
- money transfer
- seat reservation
- order creation with inventory update

## 3. When not to use transactions

Do not wrap everything in transactions.

Transactions cost more and can increase contention.

For simple single-document updates, atomic operators are often enough.

## 4. Eventual consistency mindset

In large systems, some data becomes consistent later.

A professional engineer designs for that by using:
- pending states
- reconciliation jobs
- retry-safe operations

## 5. Reliable application design

Important patterns:
- idempotency keys
- retry-safe APIs
- outbox pattern for events
- compensating actions in long workflows

## 6. Study goal for Day 11

Learn how to make architecture decisions that balance correctness and scalability.
