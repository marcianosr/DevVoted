---
# DVTD-0kho
title: Terminal theme playtest round 1
status: completed
type: task
priority: normal
created_at: 2026-09-02T07:01:10Z
updated_at: 2026-09-02T08:25:13Z
parent: DVTD-tduu
---

Six fixes from the first /proto-run playtest of the terminal wiring.

- [x] Custom Tooltip replaces the browser title attribute on IconButton
- [x] Green badges on GateClearScreen coverage gains + total, and the BuildList total
- [x] Removed the Trail's visible 'Polls in this gate' label
- [x] Removed PrepScreen's 'about N right answers' coverage hint
- [x] Row spacing: min-h-9 + py-1.5 so badge and text rows share a rhythm
- [x] Audits cue no longer right-aligns when it wraps

## Summary of Changes

**Tooltip (new).** `IconButton` drew the browser's native `title` bubble: OS font,
half-second delay, unstyleable. New `Tooltip.ui.tsx` wraps the trigger and shows
a styled bubble on `group-hover` and `group-has-[:focus-visible]`. The
focus-visible half matters: a plain `:focus` reveal pins the tooltip open after a
click, which is the bug modern-theme hit and fixed the same way. `aria-label`
still carries the hint, so nothing changed for a screen reader.

**Green badges.** `Figures` already tokenises a signed figure into a toned Badge,
and both places were bypassing it with plain `Text`. GateClearScreen's coverage
rows and total, and BuildList's total, now run through `Figures` — so they also
inherit the rule that a multiplier under 1 reads cinnabar rather than green.

**Trail label removed** from the visible row, kept as the `<nav>`'s aria-label.
The crumbs are the readout; the sentence beside them said nothing the dots did
not.

**Coverage hint removed.** "about N right answers" was mine, added when wiring
prep. Dropped from the kit prop as well as the adapter, so nothing can pass it.

**Row spacing** is kit-wide: `min-h-9` plus `py-1.5` on `Row`, which is the one
list item everything composes. A row whose trailing slot holds a Badge measured
taller than one holding plain text, so a three-row section had three different
heights. The min-height evens them and the extra padding lifts the text off the
dividers.

**Audits cue.** `ml-auto` right-aligned the cue, which reads fine on one line and
badly the moment the cue wraps onto its own — it then sat hard against the right
edge under a left-aligned name. Now `min-w-0` and it flows left.

## Verification
tsc 0; oxlint + dependency-cruiser clean (899 modules); 2631 passing / 3 failing
(the same pre-existing modern-theme RewardScreen three); terminal-theme stories
typecheck 0; /proto-run HTTP 200.

Two of my own specs asserted the copy that was removed and were updated, not
deleted around: PrepView lost the hint assertion, PollView now scopes its crumb
count to the trail nav.

Storybook needs a restart — the tooltip classes are new utilities.

## Round 2 (2026-09-02)

**One facts line on the question page.** The category badge, the meta line
("scores ×1 3 options") and the two saffron notice lines were three separate
things saying one thing. `PollScreen.meta` and `PollScreen.notices` are gone,
replaced by `facts: readonly PollFact[]` — `{label?, value?, tone?}` — rendered
as one bordered line: category badge, then `· label value` per fact with the
value in a toned Badge. The retry cost is **omitted entirely when
`peelSlotsOnFailure` is 0**, since there is nothing to remove.

Kept the word "slot" rather than the mock's "config": `peelSlotsOnFailure` counts
slots, GateHoldScreen counts slots, and PrepScreen already says slots. Mixing
the two units would be wrong, not just inconsistent.

**Question size** `score` → `hero` (text-xl → text-2xl).

**"this answer" → "Total"** on the build rail.

**Coverage bar on prep and shop.** `RunHeader` (poll/reveal) always had it;
`Header` (prep/shop/new-run) did not, so the bar vanished the moment you left a
poll. `Header` gained an optional `coverage`, and `coverageFor(view)` is now one
exported helper both headers share, so the two readings cannot drift.

**Byline below the submit button.** New `Byline.ui.tsx`. This needed data that
did not exist client-side: `polls.created_by` is a uuid the run pipeline never
read. Plumbed `author` through `RunPoll` → `redactPoll` → `PollView`, with a
`leftJoin` onto `usersTable` in both `ENGINE_POLL_COLUMNS` queries, formatted as
`@github_username`. Left join, not inner: a poll whose author was deleted still
has to deal.

`role` ("Frontend developer" in the mock) is **not** wired. The only role on
`usersTable` is the `userRoles` permission enum (user/admin), which is not a job
title. `Byline` takes an optional `role`; nothing passes it until there is an
honest source.

### Tooling
`createMockDb` gained `leftJoin` in `CHAIN_METHODS`. The mock enumerates the
query-builder methods the repository uses and simply had no entry for it — 11
repository specs went red on the new join until it was added.

### Verification
tsc 0; oxlint + dependency-cruiser clean (900 modules); 2632 passing / 3 failing
(the same pre-existing modern-theme RewardScreen three); terminal-theme stories
typecheck 0; /proto-run HTTP 200, no server errors.
