---
# DVTD-9dn0
title: Wire modern-theme screens into /proto-run
status: in-progress
type: feature
priority: normal
created_at: 2026-08-23T20:35:40Z
updated_at: 2026-08-24T08:32:18Z
---

Connect the Storybook-only kit at src/ui/modern-theme/screens/ to the run loop, in the /proto-run dev rig first. The real _authed/run/* routes are the next pass and reuse the same adapters.

Approach: six Tier-2 `.component.tsx` adapters under src/modules/run/*/presentation/, each taking a RunView slice plus callbacks and rendering a modern-theme screen. Plan: ~/.claude-work/plans/i-want-to-reskin-dazzling-cerf.md

## Kit changes
- [x] PollScreen: onSubmit? + submitLock? footer action (story + spec)
- [x] ShopScreen: onContinue? + exitLock? footer action (story + spec)
- [x] audits.ts: toAuditId(id) guard, collapses timeout-N / strip-N
- [x] format.ts: move capLabel in from Plan.stories.tsx

## Adapters
- [x] run/run/presentation/PollView.component.tsx
- [x] run/shop/presentation/ShopView.component.tsx
- [x] run/run/presentation/PrepView.component.tsx
- [x] run/gate/presentation/RewardView.component.tsx
- [x] run/run/presentation/ReviewView.component.tsx
- [x] run/gate/presentation/RemovalView.component.tsx

## Route
- [x] proto-run: swap six branches, drop ~/ui/Screen.ui + RunHud on those
- [x] stripStep gains a "summary" step (reward-held before removal)

## Out of scope
configuring/StartScreen (different mechanic, ADR-026), community board, run summary. Module screens stay live behind _authed/run/*.

## Summary of Changes

Six of /proto-run's nine branches now render the modern-theme screens, through six
Tier-2 adapters that take a RunView slice plus callbacks. The adapters are the
deliverable: the real _authed/run/* routes render the same ones next pass.

### Adapters (new)
- run/run/presentation/PollView.component.tsx (19 tests)
- run/run/presentation/PrepView.component.tsx (13)
- run/run/presentation/ReviewView.component.tsx (5)
- run/shop/presentation/ShopView.component.tsx (16)
- run/gate/presentation/RewardView.component.tsx (12)
- run/gate/presentation/RemovalView.component.tsx (5)

### Kit changes
- PollScreen: onSubmit? + submitLock?; ShopScreen: onContinue? + exitLock?. Neither
  screen could be played before — no submit, no exit. Both mirror PrepScreen's
  existing onStart/startLock, where the lock reason IS the button label.
- audits.ts: toAuditId() collapses the model's timeout-3/4/5 and strip-1/2 onto the
  kit's one Timeout and one Strip. Narrowed with a type guard over AUDIT_ORDER, no cast.
- format.ts: capLabel moved in from Plan.stories.tsx (two runtime callers now).
  planLadderAt could NOT follow it — it runtime-imports storagePlanLadder, which
  ui-stays-presentational forbids outside .stories. It lives in ShopView instead.

### Flow change
A held gate now goes RewardView(outcome:"held") -> RemovalView, so stripStep went
from "strip"|"review" to "summary"|"removal"|"review". RemovalScreen batches where
the reducer does not: the peel and the resume-climb land in one setState, so a
half-peeled build is never drawn.

### Mechanics kept that the kit had no slot for
- Lint and peek hang off the config row that sells them (Entry actions), not a
  toolbar. Gone while an audit has that config offline.
- The bought peek split reads onto each option as "N% picked this" via Choice.note.
  A cross-out wins over it: that one changes what is pickable.

### Dropped on the converted branches
~/ui/Screen.ui (the modern screens carry their own shell and footer) and RunHud
(GateHeader/ShopHeader already carry storage, swatch track and audit strip). Both
stay on configuring, community and won/dead. Cost: those six branches lose the
slide transitions and the <body data-gate-theme> mirroring; the article tints itself.

### Still on the old look
configuring (StartScreen expects a dealt hand, the engine offers three starter
stacks — ADR-026), community (no modern screen, DVTD-wii3), won/dead (no modern
screen). No module screen was deleted; all six stay live behind _authed/run/*.

### Verification
tsc 0 errors; lint + dependency-cruiser clean (727 modules, 2876 deps — proves
modules -> ui/modern-theme is permitted); 2163 passing, 3 failing (the pre-existing
RewardScreen copy assertions, red before this started); stories typecheck 0 errors
in src/ui/modern-theme; vite build emits every new class; /proto-run serves HTTP 200
with no server errors. Storybook needs a restart for the new CSS hash.

### Known gaps
- Code blocks lose syntax highlighting: the old screen ran codeBlock through
  PollMarkdown (rehype-highlight, 5 languages); Code.ui takes plain lines. This
  pass splits on newlines. Highlighting belongs inside Code.ui.
- codeSandboxUrl has no slot on any modern screen. No rig fixture uses it.
- newConfigIds / justUnlockedSlots highlighting is not carried: Entry has no prop
  for "just bought". ShopView marks new configs with mark="warn" as a stopgap.

## Follow-up: readability pass + start screen (2026-08-24)

Marciano playtested /proto-run. Four changes.

**Row dimming moved to the button.** Entry.dimmed put opacity-50 on the whole row via Row, so an unaffordable offer lost the config name that is the only thing the shelf exists to show. The PriceTag now carries disabled:opacity-50 + disabled:cursor-not-allowed itself, and neither ShopView nor PollView dims a row any more. Same rule applied to the poll rail: mark=fail plus the word offline say a config is down without costing it its name. The sealed ??? plan rung keeps its dim — nothing to read there.

**Cursors.** cursor-pointer on Action, PriceTag and Lock (the two pressable states only — unavailable renders a bare span). Mark keeps cursor-help: it is a hint, not a press. Choice/Pick/Plan/Tabs/Filter/Disclosure already had one.

**Screen is capped.** mx-auto w-full max-w-6xl on the shell, so the cap sits above the headers and a screen borders end with it. Every screen inherits it. Dropped the narrow variant I had drafted — nothing used it.

**Start screen wired.** Reverses the earlier decision to leave configuring on ConfiguringScreen. New adapter run/pipeline/presentation/StartView.component.tsx (11 tests).

StartScreen needed extending first: combo was singular and nameless, and the engine offers three named stacks with a recommendation (ADR-026). So StartCombo gained id, name and recommended, and the prop became combos: readonly StartCombo[]. Without that, two of the three stacks plus every name and the recommendation would have been dropped on the floor.

- dealt = the 8 distinct configs the three stacks are built from (.js is in two), so a stack can be taken whole via combos or mixed from the same rows. That folds in what the old screens Customize all 3 slots link did.
- The ConfigFamily map finally exists, in StartView: focus->category, amplify->multiplier, economy->storage, defense->tool, risk->gamble. One-to-one, and Family.ui always said the mapping was a Tier-2 job.
- seed and archive are now optional and omitted: the rig has no run seed and nothing banks into an archive yet. Better a shorter header than an invented figure.
- lock and rebuild left off — ADR-029 sells Lock in the shop, and whether it belongs on the run-start deal is DVTD-4fxt, still a draft.

RunHud now shows only on community, the one surface left without a header of its own.

Verification: tsc 0, lint + dependency-cruiser clean (729 modules), 2185 passing / 3 failing (the same RewardScreen copy assertions), stories typecheck 0 errors in modern-theme (it caught the three combo call sites CI cannot see), emitted CSS unchanged so no Storybook restart needed, /proto-run serves 200.

ConfiguringScreen stays live behind _authed/run/configure.

## Follow-up: config figures as badges (2026-08-24)

**headlineFigureOf(config) in config.model.ts.** Returns data, not prose: {kind: multiplier|coverage|kb, value}. The figure was only ever in the explainer sentence ("React polls pay 1.25x coverage."), and a sentence is not something you compare three rows on. Parsing the number back out of describeOf would have drifted the first time the copy changed, so the model states it directly. Order follows what the description leads with: focus (level-scaled via focusCoverageMultiplier) -> coverageMultiplier -> coverageAdd -> storagePerCorrect -> storageOnClear (level-scaled). Undefined for anything priced in something a signed badge cannot say — a doubling fee, a percent of held storage, a one-in-N chance. 5 tests.

Wired as a Delta badge into the row slots that already existed for it and were going unused: DealtConfig.note (StartView) and PrepConfig.note (PrepView). PollView had its own two-field version — replaced with the shared one, so it now covers coverageAdd and storageOnClear too. ShopView pipeline rows gained it beside the rarity Dot; its OFFER rows keep the preview delta instead, which answers "what does this buy me" rather than "what does this config say".

**StartScreen peel line.** "a miss removes" / "1 config" became "Failing the gate" / a cinnabar Chip reading "remove 1 config". It is the one figure on that panel that is a loss, so it wears the losing colour instead of sitting in the same grey as the demands.

Verification: tsc 0, lint clean (729 modules), 2194 passing / 3 failing (the same RewardScreen copy assertions), stories typecheck 0 errors in modern-theme, emitted CSS unchanged (Chip cinnabar and celadon tints both already existed — no Storybook restart), /proto-run 200.

## Follow-up: playtest fixes (2026-08-24)

- [x] Reward screen read the gate *ahead* for its colour and its threshold. On a
      clear `gatesCleared` has already moved on, so clearing Pallet showed a
      pewter (Boulder) swatch graded against Boulder's demand. Added
      `RunView.clearedGateDemand` beside `clearedGateNumber`, and `RewardView`
      now takes its theme from `swatchForGate(clearedGateNumber)`.
- [x] `Screen` split into a full-bleed tint and a capped, centred body — the
      gate glow reaches both page edges, the content stays at `max-w-6xl`.
- [x] `Fold` drops its bottom rule when it is the last section in a column
      (`last:border-b-0`); columns no longer end on a hanging line.
- [x] `PriceTag` gained `hint?`, shown through `Tooltip` and appended to the
      disabled tag's `aria-label`. `ShopView` names the refusal short-form:
      "Can't install, no free slot" / "Can't install, not enough data", and the
      extend/pin tags say the same when the balance is short.

## Follow-up: badges, controls, affordances (2026-08-24)

- [x] Six more configs now carry a headline figure: Cold Start / Overclock
      (`openerCoverageMultiplier`), `.length` (`storagePerExtraPick`), Moore's
      Law (`interestPctOf`), Freemium (`draftCostFactor`), Dependabot
      (`autoUpgradeOneInOf`). Two new `ConfigFigure` kinds: `percent` and
      `chance`. The six remaining bare configs are switches with no number.
- [x] `Figure.ui.tsx` replaces the four copies of `figureFor` in PollView,
      PrepView, ShopView and StartView.
- [x] `Action`'s `quiet` emphasis is filled, not outlined — the poll rail's
      lint/peek presses did not read as pressable.
- [x] `StoragePlan` drops the rule between its prose and the bill line.
- [x] `PriceTag`'s open-state verb carries the unit: "extend · 48 KB".
- [x] `ShopScreen` gained `draftControls`, sitting between the offers and the
      storage plan. Extend moved there; the git tag stays run-level.

## Follow-up: uninstall, rarity tints, wiki (2026-08-24)

- [x] "deinstall" → "Uninstall" everywhere in the kit, with a new `uninstall`
      glyph and the refund quoted on the button (`sellRefundIn`).
- [x] Rarity tints every row that lists a config — `Entry` (poll rail, prep,
      shop pipeline, shop offers, start preview) and `Pick` (the start deal, the
      removal list). `RARITY_TINT` in `rarity.ts`,
      `.legendary-shimmer` in `app.css` (Kanto stops at 12%, drifting, with a
      `prefers-reduced-motion` override). `Entry` and `Pick` gained `rarity?`,
      and their hover/open lifts went translucent so the tint survives them.
- [x] Rarity treatment reworked to a **rail** (2026-08-24): a 4px full-strength
      `RARITY_FILL` bar at the row's left edge, absolute rather than a border
      because the legendary's is a gradient. `RARITY_WASH` fills the legendary
      row alone. `Dot` gained `shape="bar"` so `RARITY_LEGEND` keys the rows in
      their own marker; the legend now sits under both pipelines.
      Superseded: the full tint + border below.
- [x] ~~Tinted rows are framed and gapped: `RARITY_EDGE` at half strength
      (legendary reuses `.legendary-ring`), the border WIDTH reserved on every
      row so heights match, and `gap-1` on the fold and removal lists. Only one
      border-colour utility is ever on an element — stacking `border-transparent`
      under the rarity colour left the winner to Tailwind's source order, which
      emits transparent last and painted out all three flat edges.~~
- [x] Off-by-one fixed in two places: a plan rung said "opens when gate
      {fromGate} clears" when it opens on the clear BEFORE that gate
      (`planOpensAt`), and `Slot` said "opens at gate N" while you were standing
      at gate N ("opens when gate N clears").
- [x] PrepScreen counted the gated slot into the build width, reading a full
      3-slot build as "3 / 4".
- [x] Wiki §2.8 gained a payout column and had its slot column moved one row
      later — it was the only column on the "clearing gate N" reading while
      plans, Lock and Extend all read "while facing gate N".

## Follow-up: shop column order (2026-08-24)

- [x] The shop's left column reads Draft → Storage plan → git tag, each section's
      figures true for a longer horizon than the one above.
- [x] Extend is the shelf's own last row (an `Entry` with a framed glyph where a
      taken row's lock sits), not a panel below the list. `draftControls` is gone.
- [x] git tag became a `Fold` like its siblings instead of a bordered `Control`.
- [x] `Fold` gained `subtitle` ("this shop" / "this run" / "next run") and `icon`.
- [x] Rebuild moved from the fold header's trailing corner into the note row, so
      the press sits beside what it will cost next time.
- [x] `Glyph` gained `framed`; `Control` now reuses it instead of a local disc.
- [x] Draft counts locked offers; StoragePlan names the rung in force.
- [x] `Plan` composes `Row` at `spacing="tight"` instead of carrying its own
      `px-3 py-2.5` — it was the one list item in the kit not built on Row. The
      radio gained an explicit `aria-label`: its name had been gathered off the
      label's whitespace, which Row's spans removed.
