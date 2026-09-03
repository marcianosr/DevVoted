---
# DVTD-vg2q
title: 'Modern theme: poll screen'
status: completed
type: feature
priority: normal
tags:
    - ui
created_at: 2026-08-22T08:10:05Z
updated_at: 2026-08-22T18:20:16Z
---

New self-contained visual theme at src/ui/modern-theme/, first screen is the poll screen. No component imports from elsewhere in src/. Storybook group Modern/*.

## Summary of Changes

New self-contained theme at `src/ui/modern-theme/` reproducing the poll-screen mockup. 40 files: 13 `.ui.tsx` + `tones.ts`, one story and one spec each.

Atoms: Text, Caret, Mark, Delta, Row, Swatch. Molecules: Fold, Trail (+Crumb), Code (+Token), Choice, Question, GateHeader. Screen: `screens/PollScreen.ui.tsx`.

- No component imported from outside the folder; `skin/` was reference only.
- Palette reuses the global Tailwind tokens and the `--theme-color` plumbing, so the gate accent is one `data-gate-theme` attribute on the screen root.
- Responsive: rail sits after main in the DOM, `lg:order-first` lifts it left; narrow screens read question-first.
- Storybook group `Modern/*`; no `.storybook` or tsconfig change needed.
- Fixed while building: the blocked answer's note ran into its label in the radio's accessible name (`arr.splice(2)blocked · ESLint`).
- Deviation from the plan: the current-poll pill is cerulean, not theme-coloured, matching the mockup — "you are here" is UI state, not gate identity.

Verification: lint clean (dependency-cruiser 0 violations), tsc clean, stories typechecked via a throwaway config since tsconfig excludes them, 60/60 new tests, 1805 passing repo-wide.

Not wired into any route — Storybook only.

## Follow-up: Coverage fold + swatch investigation

Added `Meter.ui.tsx` (two-slice bar: held, projected, clamped) and `Coverage.ui.tsx` (Fold with held/required in the summary, bar + "+x% projected" / "y% required" in the body). Wired into the PollScreen story rail. 44 files, 68 tests.

The swatch was never missing from the code — `GateHeader` renders it and the DOM carries `<span class="inline-block shrink-0 bg-theme size-7 rounded-lg">`. `size-7` appears nowhere else in the repo, so a running Storybook had never generated that rule: the span got no dimensions and vanished. Every other class in the header pre-existed, which is why only the swatch disappeared. Restart Storybook. Added a spec asserting the swatch is on the header.

Also fixed: `<h2>` inside a `<span>` in GateHeader, and a `<div>` inside a `<span>` in the Coverage body — both invalid nesting.

## Follow-up 2: pipeline rows, chips, underlines, card size

- `Fold` titles now carry an underline (`decoration-zinc-700 underline-offset-4`). **Interpretation:** "underlines" read as the disclosure titles, not as rules between fold sections.
- `Choice` cards shrunk: `px-5 py-4` → `px-4 py-2.5`, label `text-base` → `text-sm`, control `size-5` → `size-4`, `rounded-xl` → `rounded-lg`, screen gap `gap-3` → `gap-2`.
- New `rarity.ts` + `Chip`, `Dot`, `Legend`, `Entry`. Pipeline rows are now Entry: mark, rarity chip, inline detail, trailing value, and an optional two-line disclosure that opens on a click anywhere in the row.
- Rarity colours per instruction: common celadon, uncommon cerulean, rare cinnabar, legendary the Kanto gradient (`legendary-ring`). Kept the repo's four tiers (`Config["rarity"]`) rather than the mock's "epic", which the domain model has no name for.

61 files, 81 tests.

## Feedback pass, 2026-08-22 (from the parallel skin/ session)

Four rounds of Marciano's Storybook feedback, all against Modern/*:

- [x] Entry: rarity moved from the bordered Chip to the Dot the Legend already uses ("remove the borders again, it's distracting"). Six outlined boxes in a column fought the marks and the values. Chip.ui.tsx is now unused by Entry but keeps its own story/spec, so it is not orphaned — delete deliberately if it is dead.
- [x] Fold: dropped `underline decoration-zinc-700 underline-offset-4` from the panel title.
- [x] Fold: gained `border-b border-edge` so stacked rail sections close with a line. Put on the component rather than divide-y on the rail, because divide-y skips the last child (Stake would have had none) and Coverage renders its own Fold internally.
- [x] Entry: every config in the poll screen now carries summary + explainer, so each row folds open. Copy taken from configRoster.model.ts ("All coverage earns ×1.5", "+8 KB storage per correct answer, up to 320 KB a run") rather than invented.
- [x] Entry: the explainer is now tone default (zinc-100) against the summary's muted (zinc-500) — they were both zinc-500, so the two lines read as one block.

Not changed, flagged instead:
- The rail's `lg:w-72` is the only use of that variant in the repo, so it is missing from a long-running Storybook's CSS. That is why collapsing a fold shifted the column width — a restart fixes it, no code change.
- Story rarities disagree with configRoster (Intellisense is rare not uncommon, IndexedDB uncommon not common, AGENTS.md legendary not rare). Left alone: correcting them changes colours he is reviewing.

Verified: 83/83 modern-theme tests, lint clean (667 modules), tsc clean, stories typechecked via the throwaway config.

## Feedback pass 2, 2026-08-22

- [x] Entry: explainer dropped from `size="body"` to `size="meta"`, so it matches the summary's 12px. It keeps tone default (zinc-100) against the summary's zinc-500 — lightness carries the hierarchy now, size no longer does.
- [x] Entry: FACTS `gap-0.5 py-1` → `gap-2 py-2`, giving the two lines room to read as separate statements.
- [x] Pipeline fold's value is toned by the pipeline's WORST MARK, not by the sign of its net KB. Shut, the fold is all a player sees of the build, so red has to mean "something is failing" rather than "the net happens to be negative". Same red here, now for the stated reason.
- [x] The story's pipeline became data (`PipelineConfig[]` mapped to Entry) so the net KB and the worst mark derive from one source instead of a hardcoded −128 beside six JSX blocks.
- [x] Removed an unused `Legend` import the stories-included typecheck caught.

Open: Legend is no longer rendered on the poll screen. Rarity is a dot now, so the legend is the only thing that teaches those four colours — worth putting back under the pipeline fold.

Verified: 83/83 modern-theme tests, lint clean (667 modules), tsc clean, stories typechecked.

## Feedback pass 3, 2026-08-22

- [x] Coverage's two notes ("+23.1% projected", "60% required") were `size="label"` — 16px, the largest body size in the theme. Now `meta` (12px).
- [x] The Stake fold's line was `size="body"` (14px). Now `meta`.

Audited every `size=` in the theme rather than fixing only the two he pointed at. The rule that fell out: **prose inside a fold body is `meta` (12px); `body` (14px) is for things you act on or navigate by** — panel titles, config labels, answer options. Those were already correct; the two above were the only outliers.

Side effect worth noting: `label` (text-base) now has no caller in any .ui.tsx. The scale has a dead step — drop it from TextSize or find it a job.

Verified: 84/84 modern-theme tests, lint clean (667 modules), tsc clean, stories typechecked.

## Feedback pass 4, 2026-08-22 — category chip + byline

- [x] Chip gained a discriminated union instead of a second component: `{ rarity }` renders the outlined config chip it always did, `{ tone }` renders a tinted category label. Neither can be asked for at once. Its existing spec and stories keep passing untouched.
- [x] Byline.ui.tsx — initial disc (aria-hidden, the handle follows it in text) + "written by @handle · 14 published". The count drops for a first-time author.
- [x] PollScreen: byline moved out of the question's meta line and down below the answers, per the mock. It is a credit, so it reads after the poll rather than before it.
- [x] Question: meta line moved ABOVE the verse and gained the category chip. These are the terms you read the question under; below the verse they arrive too late. The poll slug and the author left the meta line — slug was never in the mock, author is now the byline.
- [x] Chip.spec +1, Chip.stories +Category, Byline.spec (3), Byline.stories (2)

Verified: 88/88 modern-theme tests, lint clean (670 modules), tsc clean, stories typechecked.
New classes needing a Storybook restart: the bg-*/15 tints.

## Feedback pass 5, 2026-08-22 — tinted ground + smaller swatch

- [x] **app.css change, flagged:** new `@utility bg-theme-faint`, sitting beside bg-theme-soft. It reuses the EXACT formula already at app.css:370 for `body[data-gate-theme]` — `oklch(from var(--theme-color) 0.16 calc(c * 0.25) h)` — rather than an alpha wash. Two reasons: a themed screen and a themed page now paint identically, and an opaque crush behaves the same over any ground, where bg-x/10 shifts with whatever is behind it. Storybook has no themed <body> to inherit from, which is why the screen needs its own.
- [x] PollScreen root took `bg-theme-faint`. It had NO background at all before (`flex flex-col`), so it was showing the page through.
- [x] GateHeader swatch badge: size-7 rounded-lg (28px) → size-5 rounded-md (20px), roughly the cap height of the title beside it.
- [x] Swatch.spec updated, PollScreen.spec +1 asserting the tinted ground.

Verified: 89/89 modern-theme tests, lint clean (670 modules), tsc clean.

## Feedback pass 6, 2026-08-22 — a story per gate theme

- [x] Modern/Screens/Poll now has one story per gate: Pallet, Boulder, Cascade, Thunder, Lavender, Rainbow, Soul, Marsh, Seafoam, Volcano, Earth, Elite, Champion, plus WithoutCode and WithoutRail.
- [x] Numbers and names track GATE_SWATCHES in swatch.model.ts rather than being invented — gates count from 0, so Pallet is gate 0 and Champion is gate 12.
- [x] Fixed while generating: the old Cascade story was titled "Gate 2 · Cerulean". Cerulean is the colour; Cascade is the badge. Gate 2 is Cascade.
- [x] Each story changes ONE value — the theme name. Swatch, streak, rail accents, a picked answer and the screen's tinted ground all read it off the single data-gate-theme attribute, so the row of stories doubles as the contrast check across all 13 gates.

Verified: 89/89 modern-theme tests, lint clean (670 modules), tsc clean, stories typechecked.

## Feedback pass 7, 2026-08-22 — the last two fixed accents follow the gate

Reverses DVTD-vg2q's own "the current-poll pill is cerulean, not theme-coloured — 'you are here' is UI state, not gate identity". His call: on a Marsh gate the yellow accent stopped at the swatch and the streak while the pill and the category chip stayed cyan, which read as two themes on one screen.

- [x] Trail's current crumb: `border-cerulean text-cerulean` → `border-theme text-theme`.
- [x] Question's category chip defaults to tone "theme" instead of "cerulean"; the story stops pinning it.
- [x] Trail.spec updated, Question.spec +1 asserting the default.

Still fixed on purpose: `focus-visible:outline-cerulean`. A focus ring is a browser affordance that has to stay findable on every gate, and on Thunder or Marsh a theme-coloured ring would vanish into the accent it sits on.

Verified: 90/90 modern-theme tests, lint clean (670 modules), tsc clean.

## Feedback pass 8, 2026-08-22 — pipeline marks become discs

- [x] Mark: bare coloured glyphs → filled circular badges. pass/warn/fail are solid viridian/saffron/cinnabar discs with a dark glyph; idle stays the only outline, because a config that is not running has no verdict to state.
- [x] warn's glyph changed ⚠ → ! : inside a filled disc the warning triangle is a shape inside a shape, and the bang reads at 16px where the triangle does not.
- [x] Kept the theme's own palette rather than sampling the mock's hues, so a row's disc and its ±KB Delta agree on what green and red mean.
- [x] Mark.spec rewritten around the fill (4), and the AllVariants story's doc comment fixed — it still claimed "bare glyphs, no chip", which the code had just stopped being true.

Verified: 90/90 modern-theme tests, lint clean (670 modules), tsc clean, stories typechecked.

## Feedback pass 9, 2026-08-22 — KB units + verdict rings on the trail

- [x] Delta's `unit` now defaults to TRUE rather than false. KB is the run's currency, so the bare number was the ambiguous case; `unit={false}` is the opt-out for a column tight enough that the unit is understood. Flipping the default fixed the pipeline rows, the Entry stories and the Fold stories in one move instead of patching each call site.
- [x] Crumb: an answered poll now rings in its verdict — celadon correct, saffron partial, cinnabar wrong. Modelled as a discriminated union (`state: "done"` REQUIRES a verdict; current and todo forbid one), which flagged all four call sites at compile time.
- [x] The live crumb gained `bg-theme-soft` on top of its ring. Without it, a saffron gate renders the current poll and a partial verdict in the same colour — the fill is what separates "here" from "half right" on every gate.
- [x] Verdicts are also spoken (`sr-only` " — partly correct"), since a ring colour is not readable aloud.
- [x] Trail.stories +EveryVerdict; Trail.spec +3; Delta.spec rewritten around the new default.

Verified: 93/93 modern-theme tests, lint clean (670 modules), tsc clean, stories typechecked.

## Feedback pass 10, 2026-08-22 — the rail can be hidden

- [x] PollScreen gained a toggle beside the trail: ‹ hides the rail, › brings it back. `defaultRailOpen` (true) sets the starting state.
- [x] Kept as internal useState rather than a controlled prop pair. Whether the rail is showing is view state, not run state — a controlled version would make every caller wire a toggle it has no opinion about, and the screen already owns nothing else.
- [x] The toggle only renders when a rail was passed, so a screen with nothing to show has no dead control.
- [x] Reused nothing from Caret: it reads `group-open/fold` off a parent <details>, which a standalone button has none of. The glyph is inline.
- [x] aria-expanded plus a label that names the action ("Hide run state" / "Show run state"). No aria-controls, since the rail is unmounted while hidden and pointing at a missing id is worse than not pointing.
- [x] Skin/Screens story RailHidden; PollScreen.spec +3 (toggle round trip, starts closed, no toggle without a rail).

Verified: 96/96 modern-theme tests, lint clean (670 modules), tsc clean, stories typechecked.

## Feedback pass 11, 2026-08-22 — storage bar in the header

- [x] Storage.ui.tsx — plan name, "184 / 512 KB stored", and a Meter of used against cap. Built on the existing Meter rather than a second bar, so the header's fill and Coverage's fill are the same component.
- [x] GateHeader gained `storage?` and now sits on justify-between instead of flex-1 on the heading. The heading eating the slack was exactly why there was no middle for the bar to sit in.
- [x] Fixed w-44 on the block on purpose: a storage bar that resizes as the number grows reads as the layout breaking, not as progress.
- [x] The Meter is a real progressbar with aria-valuenow/max against the CAP, so "184 of 512" is announced rather than a bare percentage.
- [x] Storage.spec (4), Storage.stories (Empty / PartlyFull / Full), GateHeader.spec +2.

Verified: 102/102 modern-theme tests, lint clean (673 modules), tsc clean, stories typechecked. No new Tailwind classes — w-44 and h-2 already exist elsewhere, so no restart needed for this one.

## Feedback pass 12 — gate header restructure + text-xxs

Screenshot: gate identity stacked over a full-width gate ladder.

- `GateHeader` split into two rows. Identity row: swatch + title, with a new `audit` line ("1 audit · Dependency Outage") in saffron hanging off the *title*, not the swatch — title and audit share a flex column so the indent falls out of the layout instead of a hardcoded padding. Streak/progress/storage moved into the right-hand aside. Track row sits below.
- New `SwatchTrack.ui.tsx`: the 13-square gate ladder plus a derived "gate 4 / 12" label. Squares are `aria-hidden`; the label carries the meaning.
- **The label reads gate NUMBER against the LAST gate number, not position-out-of-count.** Gates count from 0 (GATE_SWATCHES: Pallet 0 … Champion 12), so gate 4 of a 13-square ladder is "gate 4 / 12". Deriving it from array position gave "gate 5 / 13" — wrong. The label is computed from the items so it cannot drift from the squares.
- `Swatch` gained `state`: earned / current / locked. Current is *filled* + outline (not hollow like skin's): on a track of thirteen it must read as an earned square plus a marker, not as a gap. Uses `outline` rather than `ring` because `outline-offset` leaves the gap transparent, so the cue survives any surface.
- `SwatchTrackItem` is a discriminated union: a `locked` gate cannot carry a theme.

## Feedback pass 12b — text-xxs

- New `--text-xxs` (0.625rem / 0.875rem line-height) in app.css `@theme`; `Text` gained an `xxs` size.
- `Entry`'s summary line ("Common · blocking 1 option on poll 3") dropped from `meta` to `xxs`. **This reverses pass 8**, which made summary and explainer the same size. Explainer stays `meta`; the stale comment claiming they match was corrected.

## Shared config changes (flagged)

`src/styles/app.css`: `--text-xxs` + `--text-xxs--line-height` in `@theme`, and an `outline-theme` @utility beside `border-theme`.

## Verification

tsc 0 · lint clean (676 modules) · 112/112 modern-theme tests (was 102). Build confirms `text-xxs`, `outline-theme`, `outline-offset-2` all emit — `.text-xxs{font-size:var(--text-xxs);line-height:var(--tw-leading,var(--text-xxs--line-height))}`.

**Storybook restart required**: `text-xxs`, `outline-theme`, `outline-2`, `outline-offset-2` are new to the codebase.

## Feedback pass 13 — rail order, coverage unit, toggle placement

- **Coverage above Pipeline** in the rail composition (PollScreen.stories).
- **Coverage states its unit**: the shut-fold value went from `38.6/60` to `38.6% / 60%`. It is the only thing visible while the fold is closed, and the body notes already said "% required", so the summary was the one place the scale was implied rather than stated.
- **Rail toggle moved and named.** It was a bare `‹` at the head of the trail row inside `main`, so it read as belonging to the breadcrumbs and named nothing. Now:
  - it lives on the rail it controls, as the rail's first child;
  - the rail column **stays put when collapsed**, holding only the toggle. A sidebar that vanishes entirely leaves nothing to say where it went — the remaining strip is the affordance;
  - the control is labelled "Run state" with a `Caret`, reusing the fold idiom already used three times in the same rail, so down = open and right = shut at every breakpoint. This also fixes the flagged bug where `‹`/`›` pointed the wrong way below `lg`, since the rail stacks below rather than beside;
  - accessible name is now "Run state" with `aria-expanded` carrying state, replacing the "Hide/Show run state" label swap.
- `Caret` gained an optional `open` prop for use outside a `<details>`; inside a Fold the existing `group-open/fold` selector still drives it, so no caller changed.

Also fixed a spec that passed vacuously: `queryByRole("button", { name: /run state/ })` never matched "Run state" (case-sensitive regex), so it asserted null against a button that would not have been found either way.

## Verification

tsc 0 · lint clean (676 modules) · 114/114 modern-theme tests · stories typecheck clean for modern-theme · build confirms `rotate-90`, `lg:w-auto`, `self-start` all emit.

**Storybook restart still required** from pass 12 (text-xxs, outline-theme).

## Feedback pass 14 — streak and progress removed

`streak` and `progress` deleted from `GateHeader` entirely, not just unrendered. An unrendered prop left in the type is what produced the `suffix` bug in skin's `Crumb` (declared, never rendered, only a spec noticed). Removed from the component, its spec (3 streak tests), its stories, and both PollScreen story/spec fixtures.

The `ASIDE` wrapper went with them — storage was the only survivor, so it is now the direct second child of the identity row.

**Note: the streak multiplier is now shown nowhere in this theme.** The gate position lives in the track and the poll position lives in the Trail, so `progress` ("4 of 5") was genuinely redundant; the streak was not. If it should still be visible, it needs a home.

Also corrected the FirstGate story: Pallet is gate 0, not gate 1 (GATE_SWATCHES counts from 0), and the story renders `ladderAt(0)`.

## Verification

tsc 0 · lint clean (676 modules) · 111/111 modern-theme tests (114 minus the 3 streak tests).

## Feedback pass 15 — spendable rows, byline

**New `Action.ui.tsx`.** ESLint's `-16 KB` was a passive value in a row that actually has an action behind it. It is now a bordered button reading `Use  16 KB` (cost in cinnabar), using `border-control-edge` — the token whose whole meaning is "something you can click".

`Entry` gained an `action` slot, and `value`/`action` are a discriminated union: they share one trailing slot, and a price you can spend has to read differently from a number the run already holds. A row cannot declare both.

Two things that needed care:
- **The button lives inside a `<summary>`.** An uncancelled click would spend the storage *and* toggle the fold in one press. `preventDefault()` on the button's click cancels the summary's activation behaviour; there is a test for exactly this.
- **Accessible name.** `label` and `cost` are adjacent spans, and name computation runs them together as "Use16 KB". `label`/`cost` are now `string` (not ReactNode) so an explicit `aria-label` can be composed, plus an optional `on` naming the target — otherwise a pipeline of these is a button list where every entry reads "Use 16 KB".

`costKb` in the story fixture is deliberately separate from `kb`: a price is not a balance, so it must not move the pipeline's net total until it is actually spent.

**`Byline`**: "written by @x · 14 published" → "Created by @x · {role}". The `published` count prop is gone, replaced by `role?: string`.

## Verification

tsc 0 · lint clean (679 modules) · 118/118 modern-theme tests · stories typecheck clean · build confirms `border-control-edge`, `hover:border-theme`, the `disabled:*` set and `py-0.5` all emit.

Stories typecheck caught a break `npm run build` cannot see: spreading `...Spendable.args` into the Unaffordable story defeated the union narrowing. Written out in full instead.

## Feedback pass 16 — rarity dots removed from pipeline rows

`rarity` deleted from `Entry` entirely: the prop, the `Dot`, the `NAME` wrapper span it needed, and the fixture field in PollScreen's `PipelineConfig`. Unrendering it would have left the same dead prop that produced skin's `Crumb` `suffix` bug.

`Dot`, `rarity.ts` and `Chip` are untouched — `Legend` and `Chip` still consume them, so nothing became orphaned.

Side effect worth keeping: `FACTS` (`pl-9`) now aligns the expanded body with the config *name*. It previously aligned with the rarity dot, one element to the left of the name, so the indent is more correct after the removal than before it.

**Note: rarity is now only stated in the summary line ("Common · …"), which is only visible while a row is open.** On a shut pipeline nothing reports it. That is a real loss of information if rarity is meant to be readable at a glance — the Legend was already dropped from this screen in an earlier pass, so there is now no colour key anywhere either.

## Verification

tsc 0 · lint clean (679 modules) · 118/118 modern-theme tests · stories typecheck clean. No test was asserting the dot, so none went vacuous.

## Feedback pass 17 — "Run state" toggle removed

The labelled rail toggle from pass 13 is gone, and with it the collapse behaviour: `defaultRailOpen`, the `useState`, the button, `RAIL_OPEN`/`RAIL_SHUT`/`RAIL_TOGGLE`, the `RailHidden` story and 5 specs. `PollScreen` is a pure function again with no view state of its own.

`Caret`'s `open` prop (added in pass 13) is reverted — that button was its only consumer outside a `<details>`, so it would have been a dead prop.

**This removes the hide-the-sidebar ability requested earlier in the session.** Not reinstated in another form, because every alternative that stays discoverable costs chrome somewhere, which is what pass 13 was and what this pass rejects. If it should come back, it needs a placement decision first.

## Verification

tsc 0 · lint clean (679 modules) · 113/113 modern-theme tests (118 minus the 5 toggle specs) · stories typecheck clean.

## Feedback pass 18 — trail crumbs use dots, "poll" dropped

- `label: "poll 3"` → `"3"` everywhere (PollScreen story + spec, Trail story + spec). The trail's nav is still named "Polls in this gate", so the word survives where it identifies the list rather than repeating on every crumb.
- **Rings replaced by the rarity-style dot.** `Dot` gained a `tone` variant (`theme`/`celadon`/`saffron`/`cinnabar`/`muted`) as a discriminated union against `rarity`, so `Legend` and the trail share one 6px dot rather than two implementations of the same shape. `CRUMB` lost `rounded-full px-3 py-0.5`; the number is now neutral (`text-zinc-400`) and the dot carries the colour, so five crumbs read as one sequence with marks on it instead of five coloured pills.
- **The live crumb is bold, not just theme-coloured.** The old pill used `bg-theme-soft` to stay distinct from a saffron partial. With rings gone there is no fill to lean on, and on a celadon or saffron gate the live dot is the same hue as a correct or partial one — weight is what says "here" on every gate. Its spec asserts `font-bold` plus `bg-theme` on the dot.
- The `sr-only` verdict text stays: a dot colour is no more readable aloud than a ring was.

Note: crumbs now carry dot + number + `›` separator, three glyphs per step. If that reads busy the separator is the thing to cut, since the dots already break the sequence.

## Verification

tsc 0 · lint clean (679 modules) · 114/114 modern-theme tests · stories typecheck clean · build confirms `bg-celadon`/`bg-saffron`/`bg-cinnabar`/`bg-zinc-700`/`size-1.5`/`font-bold` all emit.

## Feedback pass 19 — Delta wears the Chip badge

`Delta` now renders through `Chip`'s tinted variant instead of bare coloured text, so multipliers and debts read as objects rather than annotations. This also gives `Chip` a consumer again — it had been orphaned since pass 8 dropped it from `Entry`, which was on the open-questions list.

Tones: `multiplier` and `kb > 0` → viridian, `kb < 0` → cinnabar, `kb === 0` → muted.

**A multiplier is now green, reversing pass 8's reasoning.** The old spec said "keeps a multiplier muted, since it is neither a gain nor a cost". A ×2 on a working config plainly is a gain, and against a column of six configs the tint is what makes the earning ones countable without reading a word.

Two structural moves this forced:
- Multipliers moved from `detail` (muted text beside the name) into the **trailing slot** as badges, so ×1.5, ×2 and −128 KB line up in one column. They previously sat next to the name while a `−` placeholder occupied the trailing slot.
- `Entry.detail` deleted. Its only demonstrated use anywhere was the multiplier; keeping a prop whose sole story renders `×1.5` as muted text would teach exactly the pattern this pass replaces.

Spec note: the tint sits on the Chip, one element out from the text node, because `getNodeText` only reads direct text children — hence the `badgeAround` helper asserting on `parentElement`.

Left alone deliberately: the **Pipeline fold's own `−128 KB` summary is still plain text**, so the same number has two treatments depending on whether it is a row value or a fold total. Defensible (a total is not an item) but worth a look.

## Verification

tsc 0 · lint clean (679 modules) · 114/114 modern-theme tests · stories typecheck clean · build confirms `bg-viridian/15`, `bg-cinnabar/15`, `bg-zinc-100/10` all emit.
