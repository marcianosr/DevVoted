---
# DVTD-ltqb
title: 'Config: Hidden answers (thwart)'
status: in-progress
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:21Z
updated_at: 2026-09-05T09:10:04Z
parent: DVTD-72d9
---

Victim loses answer visibility, pays to reveal

## Phase 1 built 2026-09-05 — 451 Unavailable For Legal Reasons

The ask (a config that hides answers for other players, victims pay 4KB to see them) could
not ship as stated: no cross-player write exists in the live tree, and ADR-042 pillars 2/3 and
anti-pillar 4 all refuse a griefing config. ADR-058 records the reshape — the redaction becomes
a **gate audit**, which is hostile, disclosed on the stake receipt before entry, and identical
for everyone climbing that day. The social half is Phase 2, filling the same slot.

### Shipped
- **451**: window's first 3 polls arrive with 2 answers sealed as `?????`; 4KB flat buys one
  back. Sealed answers stay pickable — gambling blind is the play.
- Family `poll-reading` (blocks 300 and 404), pools A and C, explicit `DENY_PAIRS` against 403.
- `redactedOptionIdsFor` is pure, derived-never-stored, **blind to `correct`**, floor of 2
  readable answers, seeded on the poll id.
- `buyBackFeeFor` / `canBuyBack` / `spendBuyBack`; `RunState.boughtBackOptionIds` never resets.
- Label redacted **server-side** in `redactPoll`; buy-back returns the real text in the same
  round trip.
- Buy-back press sits on the answer row — the first paid action with no owning config.
- Modern-theme kit + a `redact` glyph, so the Dex does not show it as permanently unseen.

### Four reversals from design review, all recorded in ADR-058
1. Family `poll-reading`, not `paid-actions` — the latter would have made 451's own fee and
   rate-limit rules unreachable in play (402 and 429 could never co-draw).
2. Pools A and C, not B — 451 is the one audit needing no config to counter it, so it is the
   *safest* rule on a one-audit gate, not the harshest.
3. Density: 2 answers on each of the first 3 polls, not every answer on 3 polls.
4. The linter must **skip** sealed answers. Not a balance call — `disabledOptionIds` ships to
   the client, so crossing one out states that a hidden option is wrong.

### A correctness bug found and fixed on the way
`correctOptionIdsFor` matches correct answers **by label**, and `sendWith` does not commit
until the reveal is dismissed — so a redacted poll would have stayed `?????` with no ✓ or ✕
through the entire reveal. Gamble blind, learn nothing: ADR-042 pillar 1's exact failure.
`revealedPoll` restores the real text before the marks are computed. Two regression tests.

### Attribution (asked for mid-build)
"Show who sent the thwart" is a hard requirement (`DVTD-mvhv` lists attributable as one of
four), but Phase 1 has nobody to name — the audit is drawn by the calendar. It lands in Phase 2
on the stake receipt and the answer cue, both of which already print the audit's line, so no
Phase 1 change is needed to allow it. **Open: named or anonymous** (`DVTD-w5pb` left the same
question). Recommendation on file is named — an anonymous toll booth is the ambush pillar 2
forbids.

### Verified
3346 tests pass (211 files), oxlint + dependency-cruiser clean (903 modules). `tsc` clean for
this work. NOT clean overall: Marciano's in-flight `WRONG_COVERAGE_LOSS` →
`BASE_WRONG_COVERAGE_LOSS` rename leaves `build.model.spec.ts:9` and `rules.model.spec.ts:29`
importing the old name. 3 failures in `modern-theme/screens/RewardScreen.spec.tsx` are
pre-existing and unrelated (proved via dependency-cruiser: zero of the 21 modules reachable
from that spec is a file this work touched). Uncommitted per house rule.

### Phase 2 not built
Table, filing action, caps, toll to archived storage, attribution. One trap recorded: a *filed*
451 is not drawn from a pool, so the family rule will not protect it from 403.
