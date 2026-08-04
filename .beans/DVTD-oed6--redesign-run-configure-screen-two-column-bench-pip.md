---
# DVTD-oed6
title: 'Redesign run configure screen: two-column bench + pipeline layout'
status: in-progress
type: feature
priority: normal
created_at: 2026-08-01T07:11:39Z
updated_at: 2026-08-03T16:32:39Z
---

Redesign /run/configure per mockup: left column lists ALL available configs flat (no languages/tooling/perks grouping), right column shows the pipeline (N of M slots used, RoleList rows + empty slots), a compact stat strip (reward +KB, reward x, coverage x) and an inline 'on failure' line replacing the boxed RunStakes/RunModifiers.

- [x] Rewrite ConfiguringScreen.ui.tsx as two-column layout (Columns.ui)
- [x] Flat bench chip list, no family grouping
- [x] Pipeline column: slots-used subtitle, RoleList, stat strip, on-failure line
- [x] Remove now-unused RunStakes/RunModifiers (+ stories)
- [x] Update ConfiguringScreen spec + story
- [x] Changelog entry
- [x] Replace RUN/SKIP status badges with state dots in pipeline rows (dot: saffron running, gray skipped, green passed, red failed; hollow for stateless perks) — badges stay on other screens (StatusDot.ui + StatusLine indicator prop, threaded via PipelineReportRow/RoleList; ConfiguringScreen passes indicator="dot")

- [ ] Decide flat bench ordering — benchOrder() placeholder in ConfiguringScreen.ui.tsx (Marciano to implement)

## Notes

Start run stays in Screen rightAction (keeps hint popover + nav-direction transition). MultiplierSummary.ui.tsx found dead (only its story references it) — left alone, out of scope.

- [x] Pipeline row polish (follow-up round): fixed-width chip column (w-28) so descriptions align; dormant 'not triggered yet' moved from right-side value to a text-xs zinc-500 note under the description (RoleRow.note field, new Paragraph tone 'faint'); divider line under each row (divide-y zinc-700 on RoleList container — stat strip's border-t supplies the final line)

- [x] Wordy progress placement rule: counters (0/1, 5%/1%) stay as right-side values, prose (0/2 categories, steady) drops under the description — progressPlacement() + isCounter() in configRole.model, spec added
- [x] Row breathing room: StatusLine spacing variant (compact py-1 default / spacious py-3), RoleList rows + empty slots + trailing use spacious; gate report stays compact

- [x] Dot rows drop the config chip: title text tinted by check state (same tone as the value) stacked above description + note, build-log style; chip column stays for badge-mode surfaces (answering/shop/gate report)

- [x] Gives/needs lines per pipeline row (stacked/dot mode): authored `gives`/`needs` fields on Config + roster copy for all non-focus configs; `givesOf()` computes focus benefits (level-scaled); needs falls back to live check.description (escalating Unit Tests demand, focus demands with label prefix stripped). Rendered as faint-labeled lines, gives in viridian.

## Follow-up candidates
- Copy now lives in three places per config: description (tooltips/dex), gives/needs (pipeline rows), and effect.model demand() strings (HUD stakes via gateDemands + check descriptions). Consolidation candidate: demand() reading config.needs, description derived from gives+needs.

- [x] Roster is the single copy source: focus configs' gives/needs authored on configRoster (per Marciano's correction); givesOf()/demandFor() deleted; needs falls back to live check text only for the escalating correct check
- [x] Answering screen: inline pipeline strip (layout="inline" — dot + status-tinted title column + needs + counter, dormant reads 'idle'), lowercase 'pipeline' subtitle, border-t separator; RoleList/PipelineReportRow refactored from indicator prop to layout: chip | stacked | inline
- [x] PollCard: removed category-themed hr (the 'yellow line'), swatch lg→sm, category title Title→Paragraph size=sm theme tone

- [x] One pipeline look everywhere: AnsweringScreen now uses layout="stacked" (identical component+layout as configure); the short-lived "inline" layout deleted (recoverable from history). Start-run hint copy unified to 'Select a config for every pipeline slot' in both proto-run and RunConfigure (replacing 'Choose a config to start' / dynamic 'Fill N more slots')

- [x] Config chip restored as the stacked row's heading (over gives/needs): dot carries state, chip carries rarity — replaces the status-tinted text title from earlier this session

- [x] Build-log rows v2 (mock #13): plain bold titles (chip out again), authored `costs` field on Config (linters: 'fee doubles each use · linted polls must be correct'; their gives shortened, needs removed — fallback scoped to check === 'correct' so lint demand doesn't leak back in), 'passive' value for checkless configs, new 'use' StatusBadge/StatusDot variant (▸ celadon = affordance not state), RoleList getUseAction API + in-row 'use NKB' button (lint moved OUT of PollCard — props/button/stories removed), AnsweringScreen slots prop → 'pipeline · N of M slots' header (RunAnswer + proto-run pass view.slots). Named 'getUseAction' because use-prefixed identifiers trip oxlint rules-of-hooks in callbacks.

- [x] Linter row uses honest states, no ▸: 'use' StatusBadge/StatusDot variant reverted (lived one round); the row shows the standard dot — gray skipped until used, saffron running once the pledge is armed — with the celadon use button alongside. Dormant note copy 'not triggered yet' → 'skipped'.

- [x] Same stacked pipeline on the gate report (GateRewardReport rows: layout=stacked + divide-y, outcome description as fallback line, headline PASS/FAIL badge kept) and the shop load-out (layout=stacked; chipActions rows keep the ConfigActions chip AS the stacked heading — it's the sell/upgrade click target). Answer review is now the only badge surface.

## Follow-up candidates (2)
- PipelineReportRow layout="chip" has zero consumers left (every surface is stacked) — delete the chip layout + layout prop, or keep for future compact surfaces? Marciano's call.
- Shop rows now show static gives/needs from the roster; the gate report keeps its outcome copy via description fallback — two different line styles inside one visual language. Possible unification later.

## Pipeline cards round (mock approved 2026-08-01, built same day)

- [x] .prismatic-card masked gradient ring in app.css (legendary card border)
- [x] rarityCardBorder() in ui/rarityColors.ts
- [x] pipelineModifiersFor(configs) pure fn in pipeline.model + viewmodel delegates to it (+ spec)
- [x] PipelineReportRow: stacked layout becomes rarity-bordered card (header dot·title·rarity word·value/actions, divider, gives/needs/costs body); layout renamed stacked→card
- [x] RoleList: gap-separated cards (no divide-y), taller dashed empty slots, preview prop (config rendered as next-slot card, 'click to add' celadon, whole card commits)
- [x] StatBadge: from prop (old muted → arrow+new celadon) + muted valueTone (+ spec)
- [x] ConfiguringScreen: bench subtitle 'Click to add', plain chips (no ＋, noTooltip — the preview card replaces the tooltip), hover/focus preview, rarity legend, compact lowercase stat labels, old→new modifier strip
- [x] GateRewardReport + ShopScreen + AnsweringScreen on the card layout
- [x] Stories + specs updated; lint/typecheck/tests green (993 tests, oxlint+depcruise, tsc clean)
- [x] Changelog entry (amended the unreleased build-log entry to cards + new preview entry); wiki §8 updated

## Summary of Changes (pipeline cards round)

Every pipeline surface now renders rarity-bordered cards per the approved mock: PipelineReportRow layout stacked→card (header = dot · bold title · rarity word · value/✕/use/click-to-add, divider, gives/needs/costs body; description fallback for gate-report outcome copy). Legendary = static rainbow ring via masked ::before (.prismatic-card) — border-image drops radius, and a wrapper div needs an opaque fill the animated theme background can't match. RoleList: gap-3 cards, py-8 dashed empty slots, new preview prop (SlotPreview). ConfiguringScreen: hover/focus bench preview occupying one would-be slot, rarity legend, noTooltip bench chips, lowercase stat labels, old→new strip via StatBadge from prop (identity ×1 renders muted per mock). pipelineModifiersFor(configs) added in pipeline.model as the single pricing source (viewmodel + gate clear + preview all derive from it); the three modifier fns now take bare configs instead of a Pipeline. Verified end-to-end on /proto-run via Playwright: preview, commit, answering, gate report, shop popover. 993 tests, lint, tsc green.

Still Marciano's: benchOrder() TODO; delete-or-keep PipelineReportRow chip layout (still zero consumers).

### Fix: sticky preview (same day)
'Click to add' was unreachable with a real mouse: onMouseLeave cleared the preview, so the card unmounted while the pointer traveled from the bench chip to it (Marciano's screenshot: click landed on the empty slot and selected its text). Playwright's teleporting click had masked it. Fix: the preview is sticky — set on hover/focus, replaced only by hovering another chip or committing; onMouseLeave/onBlur clearing removed. Spec now simulates the travel (mouseOver → mouseLeave → click card) + preview-switch + drop-on-commit. Re-verified with real stepped mouse movement on /proto-run: hover → travel → card click slots (1/3), direct chip click slots (2/3). 995 tests green.

### Polish: dormant note removed (same day)
Marciano: the 'skipped' line under gives/needs is redundant — the gray dot already carries the state. progressPlacement() now returns nothing for dormant conditionals (their 'not seen' progress stays hidden too); configRole spec + RoleList story updated. Also added a canLint ts assertion to pipeline.model.spec while investigating his ESLint-on-TS report — the engine covers ts; what he saw was the wrongStillOn>1 guard on the single-wrong-option ts-multi poll (assessment reported, no rule change made).

### Polish round: white chips, ghost preview, celadon primary (mock #4)
- Config chip labels white everywhere (rarity carried by border+tint); RARITY_COLORS.legendary.border → new border-only .prismatic-border class (prismatic-chip would animate the white text along)
- Preview card is a ghost: dashed rarity border (legendary dashes use the animated border-color — the gradient ring can't dash); interactive-card hover now tints bg instead of fading (colored border stays at full force)
- Button primary variant: theme-solid → celadon (border+text celadon, celadon/15 fill) — CTA color unified with use-button and click-to-add; affects Submit/Next/Continue/ConfigActions popover too
- Rarity legend dashes dropped per mock
- ConfigChip.spec + ConfiguringScreen.spec realigned; 995 tests, lint, tsc green; verified against mock on /proto-run

### Rework by Marciano (2026-08-02): cards → flat rows
The bordered card treatment was reverted by Marciano directly: stacked rows are flat StatusLine rows again (layout "chip" | "stacked"), rarityCardBorder/.prismatic-card deleted, GateRewardReport back to divide-y. Kept: rarity word in the heading, sticky ghost preview (dashed rarity-border box; legendary via .prismatic-border), white chips, celadon primary, legend, old→new strip, pipelineModifiersFor. Added by him: failed rows read past tense (gives→lost vermillion, needs→needed). He realigned the specs himself; suite verified green after (995). Changelog + wiki §8 updated to describe rows instead of cards.

## Back to build-log rows (2026-08-02, mock #20)

Cards reverted to the flat build-log look, one pipeline view on every surface (configure, answering, gate report, shop):

- [x] PipelineReportRow: card layout dropped, stacked restored (StatusLine dot rows); heading = bold title + rarity word in rarity color; failed rows flip gives/needs to lost (vermillion) / needed; ghost preview = dashed rarity-border box around a flat row (legendary dashes via .prismatic-border)
- [x] RoleList/GateRewardReport: rows separated by air only (no divide-y per mock); preview + layout prop API kept (layout prop removed — every consumer is stacked)
- [x] StatusDot: settled verdicts render as glyphs (green ✓ / red ✗); running/skipped/part stay dots, perks the hollow ring
- [x] Reverted: rarityCardBorder(), .prismatic-card CSS ring
- [x] "steady" removed from the no-double-miss check: CheckStatus.progress now optional, clean streak reports nothing (Marciano: the dot already says it); warning + verdict lines stay; spec added
- [x] CHANGELOG + wiki §8 realigned; 996 tests, lint+depcruise, tsc green

- [x] Answering screen pipeline header unified with configure: lowercase "pipeline · N of M slots" Subtitle replaced by Title "Your pipeline" + Subtitle "N of M slots used" (slots line only when slots provided); spec realigned
- [x] RewardScreen spec realigned after Marciano dropped the "Build pass!" headline + "Pipeline summary" subtitle from GateRewardReport (unused Subtitle import removed); 996 tests, lint+depcruise, tsc green

## Pipeline table round (mock #23, 2026-08-02)

Labeled gives/needs lines became an aligned table: config · effect · condition · state.

- [x] PipelineTable.ui.tsx: five-column grid (mark gutter + 4 headed columns), lowercase faint headers, rows join via grid-cols-subgrid
- [x] PipelineReportRow: layout stacked→table (subgrid row; config cell = bold name + rarity word, or ConfigActions chip in the shop; effect = gives in viridian; condition = needs + costs (vermillion) + note; state cell right = counter/use/✕/passive/click-to-add). Gate-report rows without gives/needs span description across effect+condition. lost/needed past-tense flip dropped (column headers are fixed); failed needs tints cinnabar instead
- [x] StatusDot: StatusDotVariant = StatusBadgeVariant | "use" — ▸ pewter marks a usable-but-idle config; yields to the honest dot once armed/settled (usable prop on PipelineReportRow, set by RoleList when getUseAction hits)
- [x] Roster copy compacted to mock style ("×1.5 Ruby" / "1 correct Ruby", "+8KB each, to 320KB" / "3 correct", "−1 wrong answer on JS/TS" / costs "doubles each use", "×2 all"). Deviations from mock, both to keep info: linter costs omit the 8KB base (live fee stays on the "use 8KB" button); IndexedDB keeps the 320KB cap
- [x] GateRewardReport onto PipelineTable; ghost preview = dashed rarity box with -mx-3/px-3 so cells stay in column
- [x] Verified on /proto-run via Playwright: configure (headers, ghost preview), answering (▸ + use button), gate report; 996 tests, lint+depcruise, tsc green
- [x] Changelog entry rewritten to the table; wiki §8 updated

- [x] Responsive table (mock #24): under sm (640px) the header row hides and each row folds to two aligned lines — mark · config+rarity · state on line 1, effect · condition indented under the name on line 2. Narrow container drops to 4 columns (sm keeps 5); cells place via responsive col/row-start on the subgrid; empty slots/trailing span col-span-4 sm:col-span-5. Verified at 480px and 1280px on /proto-run; 996 tests, lint+depcruise, tsc green
