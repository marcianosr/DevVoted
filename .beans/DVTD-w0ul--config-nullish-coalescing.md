---
# DVTD-w0ul
title: 'Config: Bug Bounty'
status: todo
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-08-19T11:47:16Z
parent: DVTD-72d9
---

Zero reward replaced with storage


## Design (2026-08-18, Balatro-inspired session)

**Effect: +16KB storage per wrong answer.** The roster's first loss-side
trigger — every other benefit fires on correct answers or gate clears. Reward
axis (storage) is shared with IndexedDB (+8KB per correct), but the trigger
inverts it, so this is a hedge: it pays exactly when the rest of the build
doesn't. Also softens the post-peel redo spiral (ADR-037): you re-run the gate
weakened, and misses at least feed the bank.

- Family: risk. Rarity: uncommon. Numbers vs IndexedDB: wrong answers carry
  real cost (window meter −0.25, streak break, miss risk), so pay double.
- Grades off the ASKED question (ADR-038 D6 `mirrored`), so the Mirror gates
  can't be double-dipped: a mirrored-wrong answer is just wrong.
- Timeout-audit misses submit no pick → not a wrong answer → no payout.
- Not an infinite farm (the DVTD-ineo scrap test): tanking subtracts from the
  same net meter the gate audits; re-failing escalates the peel.

**The tuning question — sandbagging.** Once the window meter clears demand,
excess window coverage is worthless (per-gate reset), so deliberately missing
the last poll is ~free KB (cost: 0.25 dead coverage + streak). Candidate guards:

1. Pays only while the window meter is below the gate's demand (readable on the
   meter: "pays while you're behind" — and bounties pay for real bugs, not
   staged ones).
2. Accept sandbagging as a choice; streak break is the price.
3. Diminishing payout per gate (first wrong pays full).

**Naming:** `??` (current title) vs **Bug Bounty** — getting paid per bug is
the literal meme and reads instantly on a chip. Rename if preferred.

Named: Bug Bounty (2026-08-19). Was: Nullish Coalescing ??
