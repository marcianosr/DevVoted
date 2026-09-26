---
# DVTD-9dn0
title: Wire modern-theme screens into /proto-run
status: completed
type: feature
priority: normal
created_at: 2026-08-23T20:35:40Z
updated_at: 2026-08-31T10:24:19Z
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
- [x] Rebuild moved from the fold header's trailing corner to below the offers
      (the fold's children, not its note), beside what it will cost next time.
- [x] `Glyph` gained `framed`; `Control` now reuses it instead of a local disc.
- [x] Draft counts locked offers; StoragePlan names the rung in force.
- [x] `Plan` composes `Row` at `spacing="tight"` instead of carrying its own
      `px-3 py-2.5` — it was the one list item in the kit not built on Row. The
      radio gained an explicit `aria-label`: its name had been gathered off the
      label's whitespace, which Row's spans removed.
- [x] `--theme-ground-chroma` splits the ambient ground's intensity from the one
      hardcoded 0.25: 0.12 for cerulean/vermilion/cinnabar, 0.18 for
      celadon/fuchsia/viridian/lavender, 0.25 everywhere else. `body[data-gate-theme]`
      and `bg-theme-faint` both read it, so the two cannot drift.
- [x] `Action`'s `loud` emphasis wears the gate theme instead of a fixed celadon.
      All six uses are the run's forward action (submit, continue, start, enter
      shop, take these), so no new emphasis value was needed. New utility
      `bg-theme-strong` (0.28) for its hover, one rung above `bg-theme-soft`.
- [x] `Audits.ui.tsx` extracts prep's inline audit fold into the kit, and the
      poll rail now renders it open beside the poll the rules are bending.
      Titled "Audits · N running"; suppressed rows stay listed and out of the
      count. `PrepAudit` is now an alias of the kit's `AuditRow`.
- [x] `PollScreen`'s story rail gained the Audits fold — the kit story hand-builds
      its own rail, so it had been showing a screen the app no longer renders.
- [x] `Screen` fills the page (`min-h-screen`) and centres its capped body both
      ways. `min-h` not `h`, so a screen taller than the viewport grows the page
      instead of centring its top out of reach.
- [x] StoragePlan's bill row reads "Cost per gate" with the figure in a Chip:
      cinnabar when it charges, and the word "free" rather than "0 KB" when it
      does not.
- [x] `Chip` gained a `vermillion` tone (the palette's orange, between saffron
      and cinnabar); the cost-per-gate chip wears it. New `Tones` story lists
      all eight.
- [x] The rebuild row gained `pb-3` so it does not sit on the storage plan's rule.
- [x] Shop offers name their rarity beside the dot, bold and in the rarity's own
      colour (`RARITY_TEXT`). The legendary takes `.text-legendary`, the Kanto
      gradient clipped to the glyphs, since it has no single colour to be set in.
- [x] `PriceTag` shrunk: py-1.5→py-1, pr-3→pr-2.5, pl-5→pl-4, gap-1.5→gap-1, and
      the clip-path nose 0.875rem→0.625rem. The nose and the left padding move
      together or the figure sits on the point.
- [x] Start page brought in line with prep, shop and the poll rail: the deal rows
      and the pipeline preview now carry Dot + RarityWord like every other config
      list. Restored `RARITY_TEXT` to `rarity.ts`, which `RarityWord` imports.

## Playtest round: rail width, refund hint, openable review rows

- Poll rail `lg:w-72` -> `lg:w-80`. The ESLint tool button was crushing the rarity word onto a second line.
- `Action` gained `hint?`, mirroring `PriceTag`: wraps in `Tooltip` and appends to the aria-label. Shop's Uninstall now hints `Refunds N KB`.
- `Verdict` is now a `<details>` per poll. A miss opens by default, a pass folds but opens on click; the detail is no longer suppressed for passes.
- Confirmed no bug in the lint fee: the ladder is 8/16/32/64/128/256 per poll (`LINT_COSTS`, reset on each answer), and Cost Overrun doubles it. The 16 KB seen at gate 3 is 8 x 2. Covered by run.model.spec.ts:694 and :1761.

## Playtest round: shrink the start deal

- Combo card is now name + blurb + press. Dropped the contents line (`.js + .jsx + Code Coverage`) and the family tag row; `StartCombo.ids` and `configsIn` went with them.
- Family tags gone from the dealt rows too, and the "What the families mean" fold with them (it explained a vocabulary no longer shown anywhere). `DealtConfig.family` and StartView's `FAMILY` map deleted. `Family.ui` itself stays in the kit, now unused by any screen.
- `ROW_TAG` (w-20) moved from the family tag onto `RarityWord`, keeping the figures aligned in a column.
- Starter stacks renamed to playstyles: React -> **Gamble**, TypeScript -> **Safe start**, Full stack -> **Category spread**. Blurbs unchanged. ADR-026 decision 6 amended with the reversal; contents rule stands.

- Combo cards laid out three abreast (`grid gap-2 sm:grid-cols-3`) rather than stacked full-width rows. Card contents went vertical: glyph+name+Recommended, blurb, then a full-width press pinned to the card floor with `mt-auto` so the three buttons line up whatever the blurbs wrap to.

- "Failing the gate" moved off the flat gate panel into a folded **Stake** section, mirroring the poll rail's. The peel chip rides the fold's `value`, so the headline stays readable shut.
- Added what a **wrong** answer costs, which no surface stated: `PerAnswerPreview.coveragePerWrong`, signed negative so it pairs with `coveragePerCorrect`. Mirrors the reducer's `coverageLoss` formula exactly (`WRONG_COVERAGE_LOSS x rewardMultiplierFor x gateBaseMultiplier`, rounded), so it quotes what the run takes rather than the 0.25 constant — at gate 0 that rounds to 0.3, not 0.25.
- `StartScreenProps.removeOnMiss` became `stake: StartStake`, grouping with `reward`.

- Extracted `Stake.ui.tsx` from the two hand-rolled copies (StartScreen's fold and PollView's inline one). Both compose it now, as does the PollScreen story, which had a third divergent copy.
- Dropped the `A miss removes N config and re-runs this gate.` line: it restated the header. The fatal warning stays, and the shut header trades the count for `ends the run` when the peel takes the whole build.

- `Stake` added to PrepScreen too, replacing the inline miss prose under "Clear the gate" (same duplication the start screen had). All four gate surfaces now compose the one fold: start, prep, poll rail, and the PollScreen story.

- `Stake` now opens by default and renders as an item list mirroring Rewards: `Wrong answer -0.3` above `Gate missed [remove N configs]`, same bullet and row shape. The header chip and the prose both went; a fatal peel says so on its own row instead.

- Gate panel on StartScreen converted from `<p>` facts to bulleted list rows, matching Rewards and Stake. Split into two bordered sections (gate demands, Clear rewards) instead of an `<hr>`, so all three groups on the column share one shape.

## Coverage-loss repricing (Marciano, 2026-08-24)

Two changes to what a wrong answer costs:

1. **Priced off the earn, not the gate alone.** Was `WRONG_COVERAGE_LOSS x rewardMultiplierFor(configs) x gateBaseMultiplier`, but `rewardMultiplier` is `1` on all 30 configs — the earn rides `coverageMultiplier`/`coverageAdd` instead. So a x3 build earned triple and bled the same: a miss cost 1.06 answers instead of 1.25, and the penalty faded from 5% of a gate's demand at gate 1 to 1% at gate 12. New `coverageLossFor(configs, gatesCleared)` in pipeline.model quotes it as a share of `coveragePerCorrect`.
2. **`WRONG_COVERAGE_LOSS` 0.25 -> 0.5**, so a miss costs 1.5 answers rather than 1.25.

Docs: wiki 2.5 + the constants table, ADR-013 decision 2 (formula corrected, intent unchanged) and its ADR-006 clause note, ADR-006 §11 marked superseded.

Still open: partial answers cost nothing (`auditedShare > 0 ? 0 : ...`), so banking part of a multi is risk-free. Proposed `loss x (1 - share)`; not built.

## Softlock: the shop would not let a peeled build leave

`ShopView.exitLockFor` disabled the shop exit whenever `!view.canStart` (i.e. under `min(slots, BASE_SLOTS)`). Strip 3 configs down to 1 with no storage left and there was no way out of the shop.

That rule is **ADR-031, superseded by ADR-035**: "the width demand, the blocked shop exit and the End-run click are deleted; the one width rule left is that sell and drop refuse the last config." The adapter had re-implemented it off `canStart`, which exists for the configuring screen (fill 3 slots to begin a run), not for the shop door.

Removed the lock. A stripped build now walks to the gate; if the next peel outruns it, `isStakeFatal` ends the run at the gate with a receipt, which is where ADR-035 puts death. No Game-over button needed on the shop.

`ShopScreen.exitLock` (kit prop) now has no caller — left in place, flagged.

## Streak capped at x2 (Marciano, 2026-08-24)

Measured with the real reducer: a flawless player won all 13 gates on the **starting three configs, never shopping**, overshooting the demand by ~1.7x at every gate.

Cause: `nextStreak` only resets on a wrong answer, never at a gate clear, so a perfect run reached streak 65 = **x7.5** — larger than any config in the roster sells, and free.

`MAX_STREAK_STEPS = 10` caps it at x2. Capped, not reset: resetting on a clear would punish the perfect play the bonus exists to reward (Marciano rejected that option).

Measured after, on a mixed-category pool: both starting stacks now stall at **gate 4**, so configs are load-bearing from there on.

No existing test broke — nothing asserted a streak past 10 steps. Added specs pinning the cap and the monotonicity (the bonus is never taken back). Wiki 2.5 + constants table updated.

The cap value is the dial for how far a starting build coasts; lower = shop sooner.

## Dev rig fits the viewport

`Screen.ui` hardcoded `min-h-screen`, so a screen shorter than the viewport still
measured a full one and pushed `/proto-run`'s dev rig (and the footer with it) below
the fold. The floor is now `min-h-[var(--screen-floor,100vh)]` plus `flex-1`: pages
that stack nothing under a screen are unchanged, and `/proto-run` sets
`[--screen-floor:0px]` on a `flex min-h-screen flex-col` page so the screen takes
what the rig and the log leave. Rig and log widened to `max-w-6xl` to line up with
the screen's edge.

### Layout, second pass

`min-h-screen` was stacked twice under the nav: `PageLayoutUI` demanded a viewport
below `Navigation`, and `/proto-run` demanded another inside it. The page therefore
ran ~100vh over. Now `body` is `min-h-dvh flex flex-col`, `main` is `flex-1`, and
`/proto-run` is `flex-1` inside that — one viewport shared by nav, screen, dev rig
and footer. `PageLayoutUI` is shared by every route: the change only removes an
overflow every page already had.

## Figures chipped in a config sentence

`chipFigures` (Chip.ui) splits a sentence on multiplier and signed-figure tokens and
renders each as a Chip, coloured by Delta's rule (multiplier celadon, signed by sign).
Bare integers stay prose so "1 in 4 gate clears" is not badged. Applied in
`DisclosureBody` for a string `explainer`, so every config row gets it without an
adapter change.

## Rail folds (poll screen only)

Reddit-style disc toggle at the top of the poll rail: `Glyph name="fold"` in a round
button, `Tooltip` hint that names the press ("Fold run info" / "Unfold run info"),
`aria-expanded` on the button. Folded, the aside drops `lg:w-80` for `lg:w-auto` so the
question gets the width back.

`PollScreen` takes `railOpen` + `onToggleRail`, paired the way `onSubmit`/`submitLock`
already are: no handler means no toggle, so a rail that cannot be reopened never folds.
State lives in `PollView.component` — a reading preference, not a move, so nothing in
the run state replays it. Only this screen has it; Shop and Prep rails are untouched.

### Fold disc, second pass

Two fixes after playtest: the tooltip stayed up after a click (a clicked button keeps
focus, and `Tooltip` revealed on `group-focus-within`) — now `group-has-[:focus-visible]`,
so hover and keyboard show it and a mouse click does not pin it. Applies to every
tooltip in the kit, Action hints included. The disc moved onto the divider
(`lg:-mr-6` = the rail's px-2 plus half the disc), where inside the rail it had been
covering the first row's figure.

## Playtest pass: faucet budget and the shut shop

**IndexedDB counts its allowance down.** `FAUCET_CAP_KB` is 320 a run, but the
rail only ever showed the +8 KB rate, so a spent faucet still advertised a
payout. `faucetRemainingKb(earnedKb)` now lives in `rules.model` (the reducer's
clamp and the rail's counter are the same arithmetic), `RunView` exposes it,
`PollStatusContext` carries it, and a faucet with nothing left goes
`skipped · the run's storage cap is spent` instead of online. `PipelineRow` gained
`remainingKb`, drawn as "312 KB left" beside the figure.

**The shut shop says so across the whole screen.** ADR-038's Read-only note was a
12px saffron line under the storage meter and read as a footnote about the meter.
`ShopHeader.capNote` is gone (no other caller, no story); `ShopScreen` gained a
`notice` band under the header: "Shop closed. Read-only audits the build you
already have, so nothing can be bought, sold or switched before gate N." One
statement, not seven refusals — the legacy screen's decision, carried over.

## Playtest pass: legibility on shop, prep and removal

**Price tags carry the refusal.** `PriceTagState` gained `unavailable`; the shelf
now reads celadon / cinnabar / grey for buyable / short on storage / no free
slot. `tagStateFor` splits on `refusal.reason === "no-slot"`. Before this a full
pipeline and an empty balance were the same red.

**Badges are bold.** `Chip` sets `font-bold` via Text's className. That only
works because `Text`'s `meta` size no longer carries `font-normal` — a weight
baked into a size token was silently beating every `font-bold` an ancestor set,
on equal specificity, decided by Tailwind's source order. Trail's `CURRENT`
crumb had never actually rendered bold for that reason; it does now.

**Prep screen:** the correct-answer multipliers moved from a stacked sub-line to
`Entry.notes` (inline); Audits and Subscriptions default open, so nothing on the
screen is folded; "pass or fail" is gone from the subscription rows (only "on
clear" qualifies now); the build is numbered in pipeline order; and the sentence
"Change your build in the shop." is now a `Change build in shop` press wired to
`onBackToShop`.

**Removal screen** names the cause before it asks for the configs: "Uh-oh, your
build didn't meet the coverage goal for this gate!" in cinnabar, replacing the
muted "Retry this gate".

### Correction: "inline" meant the value, not the sub-line

First pass moved the multipliers from a stacked sub-line into `Entry.notes`;
what was actually wanted was the figure off the far edge. Rewards, Subscriptions
and `Stake` now pass their figures through `notes` instead of `value`, so a row
reads `label → figure → qualifier` on one line. `Entry.value` is untouched and
still used by Pipeline, Ledger and the shop rows, where the right-edge column is
the point.

**Gate swatch is pending.** `GateHeader` rendered `Swatch` at its default
`earned` state, showing a filled badge for a gate not yet cleared. Every screen
that wears this header (Poll, Review, Prep) sits before the clear, so it is
unconditionally `state="pending"`. `ShopHeader` has the same filled badge for
the coming gate and was left alone.

### `current` swatches are hollow too

`Swatch`'s `current` state was `bg-theme` plus a ring — a filled swatch for a
gate the player is standing on but has not cleared, on both the in-run track and
the reward screen's collected row. It is now `outline-2 outline-offset-2
outline-theme` with no fill: the shape and the colour of what is on offer,
ringed to mark the place. Only `earned` fills.

### Upgrade button, and `.length` made real

**The shop's Upgrade button was gated on the wrong thing.** I had written
`config.maxLevel !== undefined && (config.level ?? 1) < config.maxLevel`.
`maxLevel` is optional and defaults to 5, so every config relying on the default
— including every Focus config in a real build — silently lost its Upgrade. Now
`isUpgradable(config)`, the domain's own predicate. The rest of the legacy
affordance came with it: price on the face, `upgradeShortfalls()` as the single
source for both the disabled state and the hint, legendary ring only when both
gates are met. Six specs added; there were none before, which is why it shipped
broken.

`shopLocked` is deliberately NOT folded into the button's disabled state — the
modern shop states the closure once in its notice band rather than on seven
controls.

**`.length` pays no KB and finally does its job.** New `revealsCorrectCount`
field; the roster entry drops `storagePerExtraPick` and moves from `economy` to
`defense`. `budgeterFor` finds it by the new field, `readsAhead` counts it as
live work, and `PollView`'s meta line now prints "this gate holds N correct
answers" (incorrect, under the Mirror). The count reached `RunView` all along;
no modern screen read it.

Leaves the per-extra-pick payout axis with no owner — see DVTD-dxif.

### Upgrade reads as a version bump

`level {n}` → `v{n}` on all three adapters plus the kit's shop story fixture.
Detail and the remaining scope on DVTD-tt4y.
