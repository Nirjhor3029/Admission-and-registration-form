# MongoDB Day 1 — Basics

This is your first day study note. Focus on understanding the core idea first.

## 1. MongoDB ki?

MongoDB ekta NoSQL database. It stores data as documents.

- Database = container
- Collection = table er moto
- Document = row/record er moto
- Field = key-value pair

## 2. Example

```json
{
  "name": "Rafi",
  "age": 21,
  "course": "Computer Science"
}
```

Ei document er moddhe:
- name field
- age field
- course field

## 3. Why MongoDB popular?

MongoDB flexible.

- schema change kora easy
- JSON-like data structure
- fast for many modern apps

## 4. Basic terms

- _id: every document er unique id
- collection: related documents er group
- database: multiple collections er container

## 5. A simple mental model

Think:
- database = folder
- collection = file
- document = one record

## 6. Tiny practice

Try to imagine this data:

```json
{
  "name": "Nadia",
  "email": "nadia@example.com",
  "active": true
}
```

Question:
- eta ki document?
- eta ki collection er moddhe thakbe?
- eta ki database er moddhe thakbe?

## 7. Study goal for Day 1

Shikhte hobe:
- MongoDB ki
- database, collection, document, field
- document er structure

## 8. Next step

Next day we will learn CRUD operations.
