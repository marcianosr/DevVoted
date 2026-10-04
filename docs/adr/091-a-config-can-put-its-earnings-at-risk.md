# ADR-091: A config can put its earnings at risk

## Status

Accepted (2026-09-20, Marciano, DVTD-eq16). Adds one config, `database`, and one
distinction to the economy: a payout can now be held before it is paid, and a
gate that does not clear can take it back. Supersedes nothing.

## Context

Every KB the run engine pays is immediate and terminal. The faucet lands in
`state.storage` on the answer, the clear payout lands at the close, and nothing
downstream has ever reversed either. [ADR-076](076-the-closing-band-decides-what-it-costs.md)
made a held gate cost the reward, the interest and the extra-pick KB, but the
faucet survives it deliberately — the wiki sells that as a feature, because the
KB earned inside a failed window is the whole budget for the retry's peel.

The consequence is that the economy has one shape. Twelve configs pay KB and all
twelve pay it the same way: as soon as it is earned, never at risk. A build's
storage plan is a question of rate, never of nerve.

## Decision 1: an escrowed faucet is a second kind of earner

`database` pays `escrowPerCorrect: 8` on each **exact** answer, into a new
`RunState.pendingKb` rather than into `storage`. `closeWindow` settles it against
the closing the gate already computes:

| `gateClosingFor` | The transaction |
| --- | --- |
| `cleared` — PERFECT, HEALTHY or **OK** | committed, paid at `ESCROW_COMMIT_MULTIPLIER` |
| `held` — SHAKY | rolled back whole |
| `fatal` — DANGER | rolled back whole |

The lifecycle copies the estimate bet (`estimate.model.ts`): a field set across
the window, inert while the window runs, settled inside `closeWindow`, and
cleared on **every** exit path rather than only the one it was designed for. A
pending balance that survives a close would pay twice at the next one.

### A new field, not `storagePerCorrect`

`storagePerCorrect` means "pays into `storage` now", and three separate
subsystems read it on that assumption: `faucetKbPerCorrect` sums it,
`scoreAnswer` banks it, and `effect.model` puts the chip online for it. Reusing
it would have made the escrow invisible at exactly the layer that has to tell
the two apart — the gate receipt shows a commit row and a rollback row, and it
can only do that if the rate that produced them is distinguishable.

## Decision 2: the cap meters the commit, never the pledge

`FAUCET_CAP_KB` is 320 across the run, and Database shares it with IndexedDB and
A/B Test's B arm, as A/B Test already shares it. The clamp therefore lives at
the commit (`escrowCommitKb`) and not at the answer, which is the opposite of
where the plain faucet clamps.

That placement is the decision. The alternative — metering the pledge — makes a
rolled-back transaction cost cap room it never spent, so a run could be locked
out of its own faucet by gates it did not clear. "Rolled back" has one honest
meaning, and it is that the run's ledger reads as though the transaction never
opened.

The price of this reading is that a committing build reaches the ceiling twice
as fast: 20 exact answers against IndexedDB's 40. That is intended, and it gives
Database an arc rather than a rate — it is an opening-game earner that goes
quiet around gate 5, the way Freemium is an opening-game plan you cancel around
gate 4.

## Decision 3: an OK close commits in full

A gate closing on the OK band breaks the streak, and the transaction is not cut
on top of that.

This originally read "an OK close is already paid less: `coverage ÷ the gate's
line` cuts the reward in proportion". That was wrong — the cut ADR-076 Decision 3
describes was never wired (DVTD-tjc7), so an OK close pays exactly what a PERFECT
one does. The decision stands on the reason below; only its premise was false.

The config is a two-state thing — cleared or rolled back — and a third,
proportional state would cost it the only property that makes it readable at the
moment the player is deciding whether to answer or to stop. It also gives
Database a job no other config has: a thin clear is exactly where the doubled
commit is worth the most.

## Decision 4: the risk is stated three times before it can be lost

A payout the player cannot watch is not a risk, it is a surprise. Per
[ADR-006](006-the-live-checklist.md)'s live checklist and ADR-038's "an offline
config says so":

- **Prep** — the band table's note names the rollback while the build holds an
  escrowing config, so SHAKY and DANGER are priced before the first answer.
- **The poll screen** — the config's chip carries `holding 24 KB` in saffron,
  not viridian. The colour is the only thing on the chip that separates held
  from earned.
- **The debrief** — a clear draws a `transaction committed` row, pulled out of
  the gate's own row so the column still adds up. A hold draws a
  `transaction rolled back` row carrying what it would have paid, with **no
  figure**: the balance never held the KB, so moving a number there would be a
  lie the total could not reconcile.

## Consequences

- `RunState` gains `pendingKb` plus `escrowCommittedKb` / `escrowRolledBackKb`
  for the receipt. They ride `RunSnapshot` for free (it is an `Omit`), and
  `hydrateRunState` heals `pendingKb` to 0 for every row written before this
  shipped — a missing numeric reaching the coverage bar is the render loop
  DVTD-znsu documents, not a wrong figure.
- **A held gate now compounds.** The window's faucet used to be the retry's
  budget; against Database it is zero, so the peel gets paid in configs instead
  of KB. That is the config's price, and it is the first dial to move if it
  plays too harsh — the multiplier before the slot size.
- Audits cannot leak escrowed KB. `auditBurnKb` clamps against
  `storage + faucetKb`, and the pending balance is in neither, so an outage
  cannot take what the run has not been paid.
- `PollStatusContext` gains `pendingKb`, and `ConfigStatus.online` gains
  `holdingKb`. Only a config carrying `escrowPerCorrect` claims the figure, so a
  build holding two faucets never prints the same KB twice.
- Database is **not upgradable**. A level ladder on a shared capped faucet stops
  mattering the moment the cap binds, which for this config is early by design.
