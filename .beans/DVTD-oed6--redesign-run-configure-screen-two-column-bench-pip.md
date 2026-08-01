---
# DVTD-oed6
title: 'Redesign run configure screen: two-column bench + pipeline layout'
status: in-progress
type: feature
priority: normal
created_at: 2026-08-01T07:11:39Z
updated_at: 2026-08-01T17:46:18Z
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
