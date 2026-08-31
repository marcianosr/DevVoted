---
# DVTD-szzx
title: Start-slot purchases hit the real archive
status: todo
type: task
priority: high
created_at: 2026-08-31T09:00:03Z
updated_at: 2026-08-31T09:00:03Z
---

`/proto-run` buys start slots against a local 512 KB number (`PROTO_ARCHIVE_KB`). A real run has to read and debit `users.archived_storage`.

Pieces that already exist:
- `debitArchive` in `src/domains/economy/api/archive.queries.ts` — atomic guarded UPDATE (`WHERE archived_storage >= bytes`), returns null when the balance will not cover it
- `fetchUserArchiveState` for the read
- `STORAGE_UNITS.KB` for the conversion; the column is **bytes**, the engine is **KB**

To do:
- server function, `getAuthenticatedUserId()` for the userId (never a client-supplied one)
- re-check `canBuyStartSlot` server-side; the client price is a display, not an authority
- refund path credits back, and must refuse once `status !== "configuring"`
- the whole buy/refund pair wants to be one transaction with the run-state write, or a refund can bank KB without narrowing the build
- test that an unauthorized userId fails
