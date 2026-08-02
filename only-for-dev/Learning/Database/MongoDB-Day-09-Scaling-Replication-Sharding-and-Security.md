# MongoDB Day 9 — Scaling, Replication, Sharding, and Security

This day moves you into production-level thinking.

## 1. Replication

A replica set has:
- primary node: handles writes
- secondary nodes: copies of data

This gives high availability and failover.

## 2. Why replica sets matter

If the primary fails, a new primary can be elected automatically.

## 3. Sharding

Sharding is horizontal scaling. It splits data across many shards.

Use sharding when:
- data volume becomes huge
- write throughput is too high
- one node cannot handle the load

## 4. Shard key choice

The shard key is critical. It affects both performance and balance.

Bad shard key = hotspots and uneven distribution.

## 5. Backups

Production systems need backups.

- Atlas: point-in-time restore
- self-hosted: dump + oplog or snapshots

## 6. Monitoring

Watch:
- query latency
- index misses
- connections
- disk usage
- replication lag

## 7. Security

Production security is non-negotiable.

Use:
- authentication
- TLS
- least-privilege users
- separate credentials per environment
- secrets in environment variables, not code

## 8. Enterprise advice

Before scaling, first optimize:
- schema
- indexes
- query patterns
- caching

Sharding is not the first solution.

## 9. Study goal for Day 9

Understand:
- replication
- sharding
- backups
- monitoring
- security
