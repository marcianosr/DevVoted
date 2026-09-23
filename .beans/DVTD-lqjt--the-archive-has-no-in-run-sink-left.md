---
# DVTD-lqjt
title: The archive has no in-run sink left
status: todo
type: task
priority: normal
created_at: 2026-09-14T17:09:27Z
updated_at: 2026-09-23T09:21:16Z
---

ADR-049 is retired and `startSlot.model.ts` is deleted, so archived storage no longer buys anything inside a run. ADR-074 flagged this as open and ADR-082 did not answer it.

Today the archive only goes up: a run's leftovers credit into it on death or victory, and nothing spends it. That makes it a number with no decision attached.

Options, none chosen:
- A pre-run purchase that is not width (a starting-hand reroll, a guaranteed focus, an extra suggested pick).
- A run-start stipend, the way a git tag rescue already works.
- Nothing, and the archive becomes purely a progression score.

## Todo

- [ ] Decide whether the archive needs a sink at all
- [ ] If it does, design one that is not width (ADR-082 rents width by the gate)

## Guarded-debit helper deleted 2026-09-23 (DVTD-wj1t Step 0)

`domains/economy/api/archive.queries.ts` carried a `debitArchivedStorageGuarded`
with no production caller — its caller (old run-start injection) died with
DVTD-9qyd, and only its own spec referenced it. Deleted rather than carried into
`src/modules/`. When this bean builds a sink, this is the shape to rebuild, and
the reasoning is the part worth keeping:

A guarded UPDATE beats SELECT-then-UPDATE because Postgres evaluates the
`WHERE archived_storage >= bytes` predicate atomically, removing the TOCTOU race
under READ COMMITTED. Callers run it inside an outer transaction when bundling
with other writes (e.g. a run insert), so a downstream failure rolls the debit
back too. Returns the new balance, or `null` when the user has insufficient
archive (no rows affected).

```ts
const [row] = await executor
  .update(usersTable)
  .set({ archived_storage: sql`${usersTable.archived_storage} - ${bytes}` })
  .where(and(eq(usersTable.id, userId), gte(usersTable.archived_storage, bytes)))
  .returning({ archivedStorage: usersTable.archived_storage });

return row?.archivedStorage ?? null;
```

`creditArchivedStorage` went the same way but needs no rebuild:
`run.repository.ts` already credits `archived_storage` inline with the same
`sql` expression pattern.
