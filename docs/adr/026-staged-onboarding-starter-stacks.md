# ADR-026: Staged onboarding — the payoff-first gate clear

## Status

Accepted 2026-08-10.

**Live:** Decisions 2, 3 and 4 (the trimmed preview, the payoff-first clear,
bench drafting), plus the guiding principles below, which outlived the mechanic
they were written for.

**Dead:** Decisions 1, 5, 6 and 7 — starter stacks, superseded by
[ADR-052](052-the-run-opens-on-a-dealt-hand.md). Two of their rules survived the
deletion and now bind `recommendedPicks`; see the note at the end.

## Context

Playtest feedback (2026-08-10): first runs overwhelm new players. The run setup
screen asked a first-time player to hold about eight concepts before answering a
single poll, and picking three configs from a bench of twenty is a combinatorial
decision with no basis to make it.

Tooltips do not fix this. They are pull-based, answering questions the player
already knows to ask. Meanwhile the same complexity is a **draw** for experienced
players, so the answer is staging exposure, not removing depth.

Three guiding principles came out of it, and all three are still load-bearing:

1. **Payoff information is self-explanatory; forecasts need grounding.** "You
   gained +64KB, spend it here" needs no explanation because it arrives with its
   own context. A forecast shown against an empty, undecided build is abstract;
   the same forecast shown against a build the player just picked is concrete. So
   the fix for "too abstract" turned out to be showing the picked build, not
   hiding the forecast — which reversed a decision mid-session.
2. **Complexity that unlocks reads as reward; complexity shown on run one reads
   as homework.**
3. **Names carry meaning: do not add a vocabulary word the game does not need.**

## Decision

### 1. Starter stacks replace the bench at run start

Dead. See [ADR-052](052-the-run-opens-on-a-dealt-hand.md) and
[rejected.md](rejected.md).

### 2. A chosen build announces itself, but shows no live progress

Each row shows the config's demand and payoff with no tap required, because that
is what a chosen build should announce about itself. Anything past that sits
behind the row's own "more details" tap.

- **No live progress before a run exists.** A window has not been played, so a
  counter like "0/1" is truthful but reads as run progress rather than a rule;
  `preRunRoleRows` strips it. Live counters return once a run is underway.
- **No jargon explaining jargon.** The Build Summary dropped a line that
  explained DevVoted with more DevVoted terminology a newcomer had not learned
  yet. The sentence itself did not survive the flow redesign, but the rule did.
- **The stake receipt's on-clear and on-fail sections are not hidden pre-run.**
  Hiding them assumed a forecast is only useful once actionable; in practice,
  once the picked build's own rows are on screen, "+32KB on clear" reads as
  confirming what you just chose. `GateStakeReceipt` lost its `variant` prop
  entirely: one shape, everywhere it is used.

### 3. The gate clear is a payoff, not a report

The reward screen shows the gate's name, one storage number, one teaching line,
and routes straight into spending it. The per-config attribution report lives on
the **failed** gate's screen, where knowing what fell short matters.

**Amended 2026-08-14: the payoff itemizes its own storage.** A ledger panel sits
under the headline figure: base reward, one row per config that paid KB this
gate, and a ruled total that is the headline number again. The original decision
threw out the whole report including the arithmetic, and playtesting the number
alone left "is this config earning its slot?" unanswerable at the one moment the
player has the evidence and is about to spend against it. What stays rejected is
the *build* report — per-config statuses, roles, coverage. Storage is the currency
the next screen charges in, so its breakdown is part of the payoff.

Two rules on that ledger:

- **A config's row is its whole gate's income, not its rate.** IndexedDB reads
  `+24KB`, never `+8KB per correct`. The rate is a shop-time question; the clear
  answers what it actually paid.
- **The base is derived by subtraction** (`total − Σ rows`), never recomputed.
  Two implementations of the payout math on one screen could disagree with the
  balance; subtracting cannot, and any source not yet itemized lands in the base
  instead of vanishing from a total the player is checking against the figure
  above it.

### 4. Bench drafting remains a first-class mode

The configure screen without presets renders the classic bench unchanged. The
no-live-counter fix applies there too, but its rows keep the full detail, since
that screen is already the precise-mechanics mode.

### 5–7. Stack risk parity, honest stack names, and the picker polish

Dead with the stacks, except for two rules ADR-052 rehomed onto
`recommendedPicks`:

- **Comparable risk.** No preset may carry an unconditional per-gate demand that
  the others do not. Depth and difficulty are meant to be a player's later
  choice, not baked silently into whichever opening looked the most fun.
- **A name has to earn the identity it claims.** A preset called "Full stack"
  that bundled three front-end configs was the opposite of what its name
  promised. Vibe names lost twice over: they were replaced with real category
  names, and then the category names lost too, once the card stopped listing its
  contents and a category told the player nothing about how the run would go.

## Consequences

- New players make one decision and are answering polls in seconds; the shop,
  free drafting and live counters introduce themselves through play.
- **Account-level unlock flags were the follow-up, not part of this ADR.** The
  full staging needs per-player intro flags. No verbosity setting and no
  simple/advanced mode: reveals key off flags that flip once.
