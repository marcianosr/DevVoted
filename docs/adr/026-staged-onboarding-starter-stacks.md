# ADR-026: Staged onboarding — starter stacks and the payoff-first gate clear

## Status

Accepted 2026-08-10. Decisions 1, 5, 6 and 7 superseded by
[ADR-052](052-the-run-opens-on-a-dealt-hand.md) (2026-09-03): starter stacks
are deleted; the run opens on a dealt hand of five with a recommended trio
preselected.

## Context

Playtest feedback (2026-08-10): the first runs overwhelm new players. The run
setup screen asked a first-time player to hold ~8 concepts before answering a
single poll — configs, rarity colors, roles, slots, pipeline, coverage, gate
swatches, storage KB, strip stakes — and picking 3 configs from a bench of ~20
is a combinatorial decision with no basis to make it. Tooltips do not fix
this: they are pull-based, answering questions the player already knows to
ask. Meanwhile the same complexity is a draw for experienced players, so the
answer is staging exposure, not removing depth.

Guiding principles:

1. **Payoff information is self-explanatory; forecasts need grounding.**
   "You gained +64KB — spend it here" needs no explanation because it arrives
   with its own context (drives Decision 3). A forecast shown against an
   empty, undecided build is abstract; the same forecast shown against a
   build the player just picked is concrete — so the fix for "too abstract"
   turned out to be showing the picked build, not hiding the forecast
   (Decision 2 was revised mid-session on this basis).
2. **Complexity that unlocks reads as reward; complexity shown on run one
   reads as homework.**
3. **Names carry meaning — don't add a vocabulary word the game doesn't
   need.** "Pack" read as a new, unexplained noun sitting alongside config,
   pipeline, gate, and storage. "Stack" doesn't: it's already the configure
   screen's heading and reuses an idea (a stack of configs) the player has
   already met.

## Decision

1. **Starter stacks replace the bench at run start.** The configure screen
   offers 2–3 curated stacks (`stack.model.ts`), each a complete `BASE_SLOTS`
   pipeline with a name and a one-liner that carries the choice — a flavor
   decision, not a math decision. Picking is one atomic reducer action
   (`pick-stack`): a stack can never half-apply. Selection is derived from the
   pipeline's contents (`stackMatching`), never stored. A "Build your own" row
   opens the classic bench for self-assembly — free drafting isn't gone, it's
   one tap away, which matters once a player has unlocked far more configs
   than any curated stack can represent.
2. **The picked stack expands into a trimmed preview, not the full pipeline
   view.** Each row always shows the config's demand and payoff
   (`StackPreviewList`, reusing `PipelineReportRow`'s `FactRow`) — no tap
   required, because that's what a chosen build should announce about
   itself. Anything past that (a linter's escalating fee, and *any* live
   check counter) sits behind the row's own "more details" tap:
   - **No live progress before a run exists.** A window hasn't been played,
     so a counter like "0/1" is truthful but reads as run progress, not a
     rule — `preRunRoleRows` strips it. Live counters return once a run is
     actually underway (Answering, Shop, gate reports).
   - **The Build Summary drops "Clear your pipeline"** — DevVoted explaining
     DevVoted with more DevVoted terminology a newcomer hasn't learned yet.
     (Superseded by Decision 7's flow redesign, same session — the plain
     sentence itself didn't survive, but the no-jargon rule did.)
   - The receipt's on-clear/on-fail sections are **not** hidden pre-run.
     Amendment during this same session: hiding them assumed a forecast is
     only useful once actionable (Context #1); in practice, once the picked
     stack's own rows are on screen, "+32KB / on clear" reads as confirming
     what you just chose, not as an abstract promise. `GateStakeReceipt` lost
     its `variant` prop entirely — one shape, everywhere it's used.
3. **The gate clear is a payoff, not a report.** `RewardScreen` shows the
   gate's name, one storage number (reward + faucet), one teaching line, and
   routes straight into spending it at the shop. Bill and downgrade lines stay
   when present — that is news. The per-config attribution report lives on in
   the failed gate's screen (`GateRewardReport`), where knowing what fell
   short matters.
   - **Amendment (2026-08-14): the payoff itemizes its own storage.** A
     `StorageLedger` panel sits under the headline figure — base reward, one
     `+` row per config that paid KB this gate, and a ruled total that is the
     headline number again. The original decision threw out the whole report,
     including the arithmetic; playtesting the number alone left "is this
     config earning its slot?" unanswerable at the one moment the player has
     the evidence and is about to spend against it. What stays rejected is the
     *pipeline* report — per-config statuses, roles, coverage, checks. Storage
     is the currency the next screen charges in, so its breakdown is part of
     the payoff rather than a second screen's worth of reading.
   - A config's row is its **whole gate's** income, not its rate: IndexedDB
     reads `+24KB`, never `+8KB per correct`. The rate is a shop-time question;
     the clear answers what it actually paid.
   - The base is **derived by subtraction** (`total − Σ rows`), not recomputed
     from `gateClearPayout`. Two implementations of the payout math on one
     screen could disagree with the balance; subtracting cannot, and any
     source not yet itemized lands in the base instead of vanishing from a
     total the player checks against the figure above it. This is why
     `interestThisGateKb` and `extraPickThisGateKb` are now carried on
     `RunView`: both price off the balance or the drawn window, so the loadout
     alone cannot recover them.
4. **Bench drafting remains a first-class mode.** `ConfiguringScreen` without
   `stacks` renders the classic bench-and-pipeline screen unchanged — same
   `preRunRoleRows` fix applies there too (no live counter pre-run), but its
   rows keep the full `RoleList` detail (demand, payoff, and cost together)
   since that screen is already the "precise mechanics" mode.
5. **No curated stack carries an unconditional per-gate demand.** Reviewing
   the stack originally named "Ship it"'s trimmed preview surfaced that Cold
   Start's check runs every gate for the whole run and a failed check fails
   the gate outright (ADR-016 §The Config Rule) — the only unconditional
   demand across the three starter stacks, and too punishing for a pick a new
   player has no way to size up yet. Swapped for Code Coverage (never miss
   twice in a row): same reckless, no-defense identity, a demand that's
   forgiving of one miss instead of none. General rule for future stack
   tuning: a starter stack's *check* surface should be comparable in risk
   across all curated stacks — depth and difficulty are meant to be a
   player's later choice (drafting, upgrades), not baked silently into which
   starter pick looked the most fun.
6. **Stack names state the real category, not a vibe phrase — and every
   stack has to earn the identity its name claims.** Two problems surfaced
   together (Marciano, 2026-08-10): "Ship it" and "Test everything" were made
   up names that didn't hint at their actual JS/React or JS/TS focus (a
   candidate rename, "React Rush," was rejected as "doesn't say anything" —
   confirmed the fix wasn't punchier vibes, it was literal information).
   Renamed to the stack's real headline category: **React** (`.js`/`.jsx`)
   and **TypeScript** (`.js`/`.ts`/ESLint). Separately, **Full stack** (kept
   its name — "full stack" is real, recognizable industry terminology, not
   an invented phrase) originally bundled `.css`/`.html`/package.json — every
   member front-end, the opposite of what the name claims. Refilled with
   `.vue` (a distinct frontend, not React/TS — already spoken for) + `.java`
   (an actual backend language) + `.git` (the one tool every stack ships
   through): a real, recognizable full-stack combo instead of three
   categories picked to fill three slots. Net effect: zero category overlap
   between the three curated stacks, and every name is honest about what's
   inside before a player reads a single chip.

   **Reversed for the name, kept for the contents (Marciano, 2026-08-24.)**
   The card stopped listing its configs at all — the deal below it is where a
   config gets read, and three contents lines made the card the tallest thing
   on the screen. Once the contents were gone, a category name told a player
   nothing about how the run would go: "'TypeScript' doesn't say anything."
   Stacks now name the playstyle: **Gamble** (`.js`/`.jsx`/Code Coverage),
   **Safe start** (`.js`/`.ts`/ESLint), **Category spread**
   (`.vue`/`.java`/`.git`). The rule for the *contents* stands: a stack is
   still a real, recognizable combo, not three categories filling slots.
7. **Playtest pass after all three stacks were live** (Marciano, 2026-08-10,
   "the preset approach solves most of the choice-stress problem"):
   - **Each config's demand and payoff share one row.** `StackPreviewList`
     stacked two full-height fact rows per config; a picked stack still read
     tall. Compacted to one wrapping row per config (`CompactFact`) — the
     "more details" tap for a linter's fee is unaffected.
   - **Every stack reads as the same clickable card, and the selected one
     just grows.** Rows sharing a `border-t` divider (an accordion/list
     feel) became bordered, gapped cards (`StackPicker`) — same frame
     selected or not, so picking doesn't restyle the whole picker into a
     different metaphor.
   - **Blurbs describe playstyle on one consistent axis** (risk/pace, not a
     mechanics dump): "Fast but risky" (Gamble), "Safer JS/TS focus" (Safe
     start), "Balanced across categories" (Category spread).
   - **One stack is flagged `recommended`** for a first-time pick —
     TypeScript, the only stack with a genuine defense (ESLint's cross-out),
     rather than the aggressive or the breadth option. Rendered as a small
     badge next to the name, reusing the existing `Badge` component (the
     same one pipeline rows already use for "new").
   - **`GateStakeReceipt` moved from headed sections to one flowing
     sequence** — `{pollsPerGate} polls → clear {reward} → fail
     {consequence}` — matching how a player actually reasons about the
     stake (what do I answer, what do I get, what do I lose), rather than
     three panels they have to visually stitch together themselves. The
     hover-preview diff (old→new value when previewing a bench pick) moved
     inline (`MetricValue`) without losing its old/new color coding. This
     is the SAME shared component `PrepScreen` and `ShopScreen` also
     render, so the flow format is universal, not stack-picking-only.
   - **"Build your own" shortened to one action line** — "Customize all 3
     slots →" — dropping the separate title + explanatory sentence, styled
     as a dashed-border card (distinct from the solid-border stack cards)
     to read as an action, not a fourth choice.

## Consequences

- New players make one decision and are answering polls in seconds; the shop,
  free drafting, and live counters introduce themselves through play.
- **Account-level unlock flags are the follow-up, not part of this ADR.** The
  full staging (bench returns by run ~3, rarity legend with the shop, an
  "I've played before" flip-all) needs per-player intro flags that do not
  exist yet. Until then every run start uses stack mode — veterans
  temporarily lose free start-drafting by default (though "Build your own" is
  always one tap away), and get it back as the default when the flags land.
  No verbosity setting, no simple/advanced mode: reveals key off flags that
  flip once.
- Stack contents and blurbs are a game-design tuning surface
  (`STARTER_STACKS`); the spec pins stack size to `BASE_SLOTS`.
- The wire schema accepts `pick-stack` with a `stackId`; the reducer rejects
  unknown stacks, stacks that don't fit the slots, and members the run was
  never handed.
- Saved personal presets (a player's own assembled build, one click,
  alongside the curated stacks) are filed as separate follow-up work — the
  natural way for veterans with a large collection to skip re-assembling a
  favorite build every run, without multiplying the curated stack list.
