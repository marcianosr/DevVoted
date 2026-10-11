# ADR-194: The hub is a headline beside its press

## Status

Accepted — 2026-10-08 (Marciano, DVTD-k5sd). Supersedes
[ADR-128](128-the-hub-leads-with-its-press.md) decisions 2 and 4 and
[ADR-147](147-the-hub-shows-the-run-so-far.md) decisions 1 and 2; amends
[ADR-183](183-the-nav-carries-the-run.md) decision 3. Built from Marciano's
`devvoted-run-wait.html` mock.

## Context

The hub led with a wide press that wore the clock as its label once the day was
spent (`Vermilion opens in 11h 16m`), drew its own strip of track, readout and
balance above it, and listed the community as a count. Since ADR-183 the nav
already carries the track and the balance on every signed-in page, so the strip
said everything twice; the press-as-clock made a refused button the biggest thing
on the screen for most of every day; and nothing on the hub showed a face, a
weight bar or what a config does, though the run view had all three.

## Decision 1: a headline states where you stand, the press states what to do

The hub is a two-column page. Left, a **headline**: the gate ahead as its title
(`Vermilion`), the run number and gate as an eyebrow (`run #14 · gate 3 of 12`),
one line of subtext (`5 polls ready · prep first`), and the gate's dashed mark
counting the polls left. Once the day is spent the title becomes `Vermilion opens
in` over a clock that ticks the seconds (`11h 16m 59s`, seconds smaller and
muted), the subtext reads `Today's polls are done. Back tomorrow!`, and the mark
holds a lock that breathes in the gate's hue. With no run open the title is the
first gate (`Pallet`) while polls are ready and `New polls in` over the clock
once they are spent.

Right, an **action group**: one `Action` press, then the community row. The press
is `Continue to <gate>` (or `Start today's climb`) while polls are ready, with the
shop as a secondary `Button` under it (`Shop · open until you start`, `skipped`,
or refused with the ADR-128 D4 hint). Once the day is spent and the gate is
paying out, the shop is the press itself — `To shop · spend 35 KB` — and the
secondary press is gone. A spent day with the shop shut refuses the climb press,
never the shop: `Action` has no hint, so the reason would have to print.

## Decision 2: the strip is gone, the readout is the headline's eyebrow

The hub draws no strip. The nav's fallback reading (`navRunFor`) already shows
the track and balance on `/run`, so the hub publishes nothing. ADR-183 D3's "the
hub keeps its own" now means the run number and gate as the eyebrow line, not a
strip.

## Decision 3: the community row shows faces, not a standing

The row under the press stacks up to ten faces of who answered today, the count,
and leads to the community board. Faces carry no `userId`: the whole row is one
link, and a link inside a link is not a thing (ADR-141). The room past ten folds
into a plain `+N`, not the popover button the board uses, for the same reason.
`N at <gate> or ahead` is dropped — the climb map on the board already says who
is ahead, and the mock did not draw it.

## Decision 4: Run so far and Build fold, and Build draws the weight

Both panels are `Fold`s (a `<details>` wearing the panel surface), open on
arrival, badged in the heading with the KB earned and the weight held. Run so
far keeps one row per close; the next gate reads `opens tomorrow` and quotes
nothing while the day waits, `next` with its band, share and clean-clear quote
otherwise. Build draws the `WeightTrack` (one segment per config, the room
apart), then one folded `ConfigChip` per config that opens on its description,
then the weight free and the way into the shop.

## Decision 5: the mock's colours are the gate's

Nothing from the mock's stylesheet is ported. The mock is cyan because its player
stands at Cerulean; in the app the press is `Action tone="action"` under the
screen's gate theme, the mark is `Swatch state="current"` (dashed, `border-theme`),
the clock is `text-theme`. At Pewter the same hub is pewter.

## Deviations from the mock, on purpose

- Rows are the kit's divider rows, not bordered cards: one chrome.
- `Fold`'s caret sits left of the title, not as a toggle on the right.
- No per-face pop on entry; each block of the page rises once, in reading order.
- The build footer keeps `0 weight free · change in shop` over the mock's
  sentence, so every screen states free weight the same way.

## Consequences

- `Swatch` gains an `icon` arm beside `count`, drawn in the same centred seat.
- `useNextPollsCountdown` takes a tick (`"minute"` | `"second"`) and returns
  `remainingMs`; the hub ticks every second, every other caller is unchanged.
  `formatClock` in `dateUtils` splits the figure for the headline.
- `todayScreen.viewmodel.ts`: `todayPressFor` and `hubStripFor` are gone;
  `hubHeadlineFor`, `hubPressFor` and `hubSwatchFor` replace them. `shopAsideFor`
  returns `null` while the shop is the press. `HubBuild` carries `held` and each
  row its `description`. `TodayCommunity` carries `faces` and `overflow` and
  loses `ahead`; `climbersAtOrPast` is deleted.
- A run that is over themes the hub by the first gate, not the gate it died at,
  so the headline's Pallet mark and the page agree.
- Two `@keyframes` in `app.css`: `rise-in` (staggered by `.screen-rise`'s
  `:nth-child`) and `hub-breathe`. Both are off under `prefers-reduced-motion`.
- The rise is every run screen's entrance, not the hub's alone: `Screen` takes
  `enter="rise"` and the eight run screens (poll, prep, gate outcome, run over,
  review, new run, shop, community) pass it; the hub puts the class on its own
  grid, since its four blocks sit inside one child of the screen.
