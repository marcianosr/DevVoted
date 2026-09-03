---
# DVTD-mfsy
title: 'Reskin: Foldable panel in src/ui/skin'
status: completed
type: feature
priority: normal
created_at: 2026-08-21T15:35:17Z
updated_at: 2026-08-21T20:41:51Z
---

First component of the UI reskin, Storybook-only. A bordered panel whose header line folds a divided list (native <details>/<summary>).

Decisions:
- Reskin lives in src/ui/skin/ because src/ui/theme/ already means gate colour theming (ADR-020).
- Self-contained raw Tailwind: the skin does not compose Title/Paragraph/TEXT_TONE, so it can diverge. Scoped exception to the design-system rule; wants an ADR if the skin survives.
- Outer fold only. The nested per-item key-value fold from the screenshot comes later.

- [x] src/ui/skin/Foldable.ui.tsx
- [x] src/ui/skin/Foldable.stories.tsx
- [x] src/ui/skin/Foldable.spec.tsx
- [x] lint, test, build green

## Summary of Changes

Three new files in src/ui/skin/, nothing else touched. No Storybook config change: main.ts already globs src/ui/**/*.stories.tsx.

- Foldable.ui.tsx: <details> panel, <summary> header (caret, title, right-aligned tally), <ul>/<ol> of <li> with divide-y divide-edge and a border-t under the header. Items are a keyed prop (id + content) rather than children, because the <li> and its divider are Tier-1 HTML. group/foldable is namespaced for the nested item fold to come. as="ol" swaps the tag only, no visible numbers.
- Foldable.stories.tsx: Skin/Foldable, w-[22rem] decorator. Default, Closed, Ordered, WithoutMeta.
- Foldable.spec.tsx: 6 tests (header text, row count, ul/ol tag, open by default, folded when defaultOpen is false).

Verified: npm run lint clean (562 modules cruised, no violations), 6/6 tests pass, tsc --noEmit exit 0.

Next: the item row component (status mark, name, detail, right-hand value) and its nested key-value fold.

## Follow-up: extract primitives + cva (2026-08-21)

Marciano's second pass. He hand-edited Foldable.ui.tsx first (p-2 spacing, no rounded corners, title at zinc-300, all doc comments deleted) — that version is the baseline.

- [x] Title.ui.tsx — cva, `as` variant drives size (h1 text-base / h2 text-sm / h3 text-xs), fixed text-zinc-300. Renders a real heading tag; Foldable passes as="h3" so the header stays 12px.
- [x] Subtitle.ui.tsx — cva, `tone` variant (muted pewter / default zinc-300), renders a span by default. Named Subtitle rather than Meta/Tally: the design system already owns that word for muted secondary text beside a title.
- [x] Chevron.ui.tsx — no cva, no variant axis; reads group-open/foldable off the parent details.
- [x] Foldable.ui.tsx composes all three; static panel/summary/list/item classes are module constants (no variant to select on). Prop meta renamed subtitle. The summary's text-xs is gone — the two typographic children now carry their own sizes.
- [x] Primitives.stories.tsx (Skin/Primitives) — all three levels, both tones, chevron shut and open, in one showcase (GateThemes.stories.tsx precedent).
- [x] Title.spec.tsx (3), Subtitle.spec.tsx (2)

Verified: lint clean (568 modules), 11/11 tests across 3 files, tsc exit 0.

## Follow-up: list item variants (2026-08-21)

Three variants from mocks: selectable (radio/checkbox), key-value meta, rich pipeline row. Decisions: real <dl> for meta, focused data-only components over a shared Row layout, controlled native inputs.

- [x] tones.ts — SkinTone/SKIN_TONE: the design system's two grays (zinc-100 default, pewter muted) plus saffron/cinnabar/viridian/cerulean. Names match TEXT_TONE. Subtitle now reads from it, so its `default` moved zinc-300 → zinc-100 (Title keeps zinc-300 as its own fixed identity, not a tone).
- [x] Row.ui.tsx — the shared line: leading · label+detail · trailing, cva `spacing` (compact px-2 py-1.5 / spacious px-3 py-2.5) + `dimmed`. Owns text-xs and the padding. `as` allows label so a Choice's hit area covers the whole row.
- [x] Mark.ui.tsx — round status glyph, cva on StatusBadge's own variant names (pass/part/fail/skip/run), aria-label speaks the state.
- [x] Choice.ui.tsx — native input drawn with appearance-none + inset-shadow hole, cva switches round/square on `multiple`. Controlled (checked + onChange). `disabled` alone dims, strikes and blocks, one prop for one fact.
- [x] Definitions.ui.tsx — real <dl> with div-grouped dt/dd. One cva variant `panel|nested` drives dividers, density AND term width together; the nested form is what a rich row folds open.
- [x] Entry.ui.tsx — mark + optional rarity dot + label + inline detail + toned value, with nested Definitions indented pl-9 (= px-2 + mark + gap-3, so a fact aligns under its label).
- [x] Foldable.ui.tsx — <li> is now bare; padding belongs to the row so a whole-row label covers it.
- [x] Stories mirroring each mock: Skin/Choice (SingleAnswer, MultipleChoice), Skin/Definitions (PollRecord), Skin/Entry (RunPipeline); Foldable's own stories use bare Rows.
- [x] Choice.spec (4), Definitions.spec (3), Entry.spec (4), Subtitle.spec (+1 accent tone)

Verified: lint clean (580 modules), 23/23 tests across 6 files, tsc exit 0.

Deliberately not built: checkbox tick glyph (checked state is a filled square, same treatment as the radio), and the old PipelineReportRow is untouched.

Post-commit fix: ba4566b (style: foldable row) landed with p-2 still on the <li>, which double-padded every row component. Removed the padding from ITEM only — a Choice row is a <label>, so padding outside it is dead hit area. text-xs and text-zinc-100 kept as the default for bare content.

## Follow-up: nested folds (2026-08-21)

Scope chosen: rows fold their own facts. Panel-in-panel deferred; when it lands the nested chrome is a left rail (his pick), not a boxed card.

- [x] Entry renders <details> whenever facts is non-empty, with the Row as its <summary> (Row.as gained "summary"). Facts imply a fold, so there is no separate `foldable` prop and no meaningless foldable-with-no-facts combination. `defaultOpen` (false) decides the starting state.
- [x] No chevron on a folding row, per the mock: the mark sits where a caret would and the whole row is the hit target (FoldableRow's documented reasoning). cursor-pointer + hover:bg-surface-raised is the only affordance, so a non-folding row stays visibly inert.
- [x] No group-name collision to solve in this scope: the inner details carries no group class, so Foldable's group-open/foldable only ever matches the outer chevron. That trap returns if a panel ever nests — the fix there is a `nested` flag driving both the group name and the rail, since Tailwind's named-group variant is a descendant selector and would leak.
- [x] Entry.spec grew to 7: plain line without facts, no fold for an empty list, shut by default, open on defaultOpen, and opens on a click anywhere along the row (jsdom does toggle details).
- [x] Skin/Entry now has RunPipeline (folded) and FactsUnfolded (the mock).

Verified: lint clean (580 modules), 26/26 tests across 6 files, tsc exit 0.

## Follow-up: style constants + Row is the one list item (2026-08-21)

Two requests. (1) CONSTANT_CASE class strings in every component, the pattern he wrote himself in Foldable.ui.tsx. (2) One row component for every list item, with size variations, usable outside a Foldable.

- [x] Every .ui.tsx declares its classes as CONSTANT_CASE consts at the top; nothing inline in JSX. cva variant maps too (SPACING, ALIGN, FILL, SHAPE, TERM_WIDTH), and cva factories renamed xVariants so a const and a function never differ only by case.
- [x] Definitions was the one variant NOT built on Row — it rolled its own pair layout. Now every pair is a Row.
- [x] Row gained `contentAs: span | dd` so a <dl> pair keeps real dt/dd cells (Row's inner wrapper would otherwise put a span between dl and dd, which is invalid).
- [x] Row gained `align: center | baseline` — form controls centre, a term aligns on the baseline of a detail that may wrap.
- [x] Row's spacing is now a three-step ramp, each step earned by a surface: tight (20px, facts folded under a row) / compact (28px, a pipeline line) / spacious (36px, a row you pick or read). Definitions maps panel→spacious, nested→tight.
- [x] Entry's FACTS indent went pl-9 → pl-7, because the nested row now brings its own px-2. pl-7 + px-2 = px-2 + mark + gap-3, so facts still line up under the label.
- [x] New Skin/Row stories: Spacings (three sizes, trailing cell, dimmed) and OutsideAFoldable (Definitions and Entry with no Foldable, no <li>).
- [x] Row.spec (4): the three paddings, centre vs baseline, dd wrapping, no trailing cell when nothing trails.

Also removed a stray `test` literal in Row.ui.tsx's JSX (left from a live Storybook poke) that rendered the word in every row and broke Choice's accessible name.

Verified: lint clean (582 modules), 30/30 tests across 7 files, tsc exit 0.

## Follow-up: Trail header bar (2026-08-21)

The gate's poll breadcrumb: dot + label + category suffix, verdict colours behind, the live poll boxed in the gate colour, unreached polls greyed.

- [x] tones.ts gained `theme: text-theme`, matching TEXT_TONE's name. The current crumb borrows whatever gate Screen.ui themed via data-gate-theme — no colour threaded through props, and bg-current/border-current on the dot inherit it for free.
- [x] cursors.ts — CURSOR_PICKABLE / CURSOR_BLOCKED, so his rule (a disabled state always answers the mouse) has one home instead of a literal per component. Choice already complied; Crumb uses the same const.
- [x] Dot.ui.tsx — the pip, extracted from Entry's inline DOT const (its rarity pip and the trail's verdict dots are one thing). One cva variant `hollow` carries both shape and size: filled size-1.5, hollow size-2, because a 6px ring with a 1px border leaves a 4px hole.
- [x] Crumb.ui.tsx — the text-with-an-icon. State is a discriminated union, not three booleans: answered REQUIRES a verdict, current and disabled forbid one, so no invalid combination compiles. Renders a span with no onSelect, a real disabled <button> with one.
- [x] Trail.ui.tsx — <nav> + Row (spacious), separators inserted between crumbs so a crumb never knows its position. aria-current=step on the live one.
- [x] Skin/Trail stories: InProgress (the mock), EveryVerdict, Clickable. Decorator sets data-gate-theme="elite" to stand in for a themed screen.
- [x] Crumb.spec (7), Trail.spec (2)

Verified: lint clean (589 modules), 39/39 tests across 9 files, tsc exit 0.

## Follow-up: poll screen (2026-08-21)

Asked for a screen in a new screens/ folder. Answered two-column, then the mock overrode it: one full-width stacked column. Built to the mock.

New components the mock demanded:
- [x] Tabs.ui.tsx — Question/Source/Answer/Explanation/Timing. cva on state (default/active/disabled); active takes border-theme + text-theme. Deliberately NOT a Row: the active underline has to land on the strip's own bottom edge, which means the tab owns the full height rather than sitting inside a padded row. Disabled tabs are real disabled buttons carrying CURSOR_BLOCKED.
- [x] Code.ui.tsx — line-numbered well (bg-zinc-950, gutter in pewter, tabular-nums, overflow-x-auto). Exports Token so a story colours syntax through SkinTone instead of writing Tailwind itself. No highlighter: lines arrive as ReactNode.
- [x] Avatar.ui.tsx — initial in a bg-theme disc for "Written by". aria-hidden, since the handle sits beside it in text.

Changed:
- [x] Trail gained a `trailing` slot for the "2 correct · 0 wrong" tally, passed straight to Row's trailing.
- [x] Choice: a checked row now wears bg-theme-soft and its control checked:border-theme/bg-theme, so the picked answer reads from across the row instead of only through a 16px dot. Also switched to the shared CURSOR_* consts.

- [x] screens/PollScreen.ui.tsx — one divide-y column: Trail, Tabs, Definitions record, question verse (line array, every line after the first indents), Code, then the options as Choice rows in a <ul>. All data props, no state.
- [x] screens/PollScreen.stories.tsx — Skin/Screens/Poll: Unanswered and Picked. Story owns the selection state; decorator sets data-gate-theme="elite".
- [x] Tabs.spec (4), Choice.spec +1 (picked tint)

Two lint findings worth remembering for story data: JSX string literals containing quotes need braces (react/no-unescaped-entities), and JSX inside an array literal needs keys even when the renderer wraps each entry in its own keyed element (react/jsx-key).

Verified: lint clean (595 modules), 44/44 tests across 10 files, tsc exit 0.

## Follow-up: gate header (2026-08-21)

The run's standing bar: theme rail, gate swatch badge, gate name + demands, streak meter, the ladder as chips, and a count.

- [x] Swatch.ui.tsx — discriminated union on size, same pattern as Crumb: a `badge` requires a glyph, a `pip` requires a state (earned/current/locked). "Locked badge" and "pip with a glyph" do not compile. Colour comes from data-swatch-theme when the caller names a gate, otherwise the ambient data-gate-theme — app.css owns every value, and `lavender` in the mock is a real theme block there.
- [x] Streak.ui.tsx — "streak ×3" plus N bars, lit ones bg-theme. The bar strip carries role=img with "3 of 4 toward the next step" so it is not a row of mute divs.
- [x] GateHeader.ui.tsx — a Row (spacious): Swatch badge leading, two-line heading as children, streak + chip track + count trailing. The theme rail is its OWN element, not border-t: border-theme and border-edge both set every side, so stacking them on one box would make the winner a cascade accident.
- [x] Skin/GateHeader stories: Lavender (the mock), Volcano (same header a gate later, proving nothing is hardcoded), FirstGate (no streak, nothing earned).
- [x] Swatch.spec (3), GateHeader.spec (4)

Verified: lint clean (601 modules), 51/51 tests across 12 files, tsc exit 0.
New classes needing a Storybook restart: size-12, size-3.

## Follow-up: swatch fixes + swatch track popovers (2026-08-21)

He asked why the header badge was grey. Answer: I had given it `bg-surface-raised` (zinc-800), a hardcoded neutral that ignores the gate. On the lavender mock that passed for right; on volcano it was obviously wrong.

- [x] Then "just make the swatch small and full color" collapsed the design: badge and pip now differ ONLY in size, so the discriminated union and the `glyph` prop are gone. Swatch = { state, size?: pip|badge, theme? }, size-4 / size-6, always solid bg-theme when earned. GateHeader lost its glyph prop.
- [x] SwatchTrack.ui.tsx — the ladder row. Every square is a button carrying its own popover: gate number, a coloured swatch beside the prize name, how it is earned, and the coverage it demands. aria-label repeats the same facts so a keyboard or screen reader gets them without hovering; locked squares are disabled and carry CURSOR_BLOCKED.
- [x] Popover.ui.tsx — CSS-only, revealed on group-hover OR group-focus-within so it is not mouse-only. Namespaced group/pop so a popover inside a fold never answers to the fold's group.
- [x] GateHeader delegates its chip row to SwatchTrack; `gates` is now SwatchTrackItem[].
- [x] Stories rebuilt around a 13-rung LADDER and a ladderUpTo(cleared) helper, which also fixed a real bug: the Volcano story previously kept the Lavender chip set, so gate 7 showed a lavender current square. Decorators gained min-h-96 so a hovered popover has room.
- [x] Swatch.spec rewritten (4), SwatchTrack.spec new (4), GateHeader.spec updated (4)

Verified: lint clean (604 modules), 56/56 tests across 13 files, tsc exit 0.
New classes needing a Storybook restart: size-6, min-h-96.

## Follow-up: gate header + pipeline rail on the poll screen (2026-08-21)

- [x] PollScreen now stacks GateHeader above Trail and Tabs, then splits: main column (record, question, code, options) and an aside rail holding the pipeline Foldable.
- [x] Dropped divide-y from the outer stack. Every bar (GateHeader, Trail, Tabs) already carries its own border-b, so the divider was drawing each line twice — the divide now lives on the main column only, where the sections have no borders of their own.
- [x] `gate: GateHeaderProps` and `pipeline?: FoldableProps` — the screen forwards whole prop objects rather than re-declaring their fields, so adding a header or panel prop does not ripple into the screen's type.
- [x] Rail is <aside> (role complementary), w-80, border-l. Absent entirely when no pipeline is passed.
- [x] Story carries the 13-rung ladder, a gate-4 header, and six pipeline Entry rows (two with fact folds). Decorator switched to data-gate-theme="lavender" to match the header mock.
- [x] PollScreen.spec new (4): header above trail, pipeline inside the rail, no rail without a pipeline, question and options in the main column.

Verified: lint clean (605 modules), 60/60 tests across 14 files, tsc exit 0.
New classes needing a Storybook restart: w-80, items-stretch.

## Follow-up: rail moves left, coverage + stake panels, responsive stack, tabs dropped (2026-08-21)

- [x] Foldable extended three ways, all demanded by the mock: `items` is now optional and `children` gives a panel a free body (Coverage and Stake are not lists); `tone` tints the summary (cinnabar for the Stake panel's header); `bordered={false}` drops the box so panels stack flush in a rail that draws its own lines.
- [x] Coverage.ui.tsx — now/projected/required bar. Projected is the same fill at 40% opacity rather than hatched: the legend already names it, and stripes do not survive a 12px-tall bar. The required marker is absolutely positioned because its place is a percentage, so it is an inline style, not a class.
- [x] Stake.ui.tsx — one chip per config in peel order (kept=viridian, peeled=cinnabar), then the summary and the consequence. Callers pass "kept"/"peeled", not colours.
- [x] PollScreen: rail moved LEFT and made responsive. The rail sits AFTER the main column in the DOM so a narrow screen stacks it below the question; `lg:order-first` lifts it back to the left when there is width. Its border follows the position — border-t when stacked, lg:border-r when beside.
- [x] `rail?: ReactNode` replaced `pipeline?: FoldableProps`. Three heterogeneous panels would have meant a prop per panel and a screen that grows forever; the rail's own dividers live on the aside so the story just composes panels.
- [x] Tabs removed from the poll screen entirely (his call — they belong to another screen). Tabs.ui.tsx and its spec stay, and it gained Skin/Tabs stories (PollDetail, AllOpen) so the component is not orphaned in Storybook.
- [x] Trail and the rest moved inside the main column, so the trail spans the question column rather than the whole screen, matching the mock.

Verified: lint clean (608 modules), 60/60 tests across 14 files, tsc exit 0, plus a stories-included typecheck pass.
New classes needing a Storybook restart: lg:order-first, lg:flex-row, w-0.5, size-2.
