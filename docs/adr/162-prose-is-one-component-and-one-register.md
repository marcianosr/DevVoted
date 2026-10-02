# ADR-162: Prose is one component and one register

## Status

Accepted — 2026-10-01 (Marciano, DVTD-qhzs). Amends
[ADR-066](066-every-figure-wears-a-badge.md) D1: a figure inside a sentence is
reached through `Prose` or `Lead`, never through a wrapper a screen writes for
itself. Extends [ADR-010](010-ui-layer-separation.md) by giving explanatory
prose a named primitive the way a figure already had one.

## Context

The game states the same kind of thing on three screens — a sentence explaining
what something does — and rendered it three ways. The config panel wrapped
`Figures` in a `<p>` of its own at `text-theme-faint` with `leading-relaxed`.
The shop's service row handed a raw string to `Typography variant="hint"` and so
never reached the parser at all. The prep screen's stake panel went through
`Lead`, at the hint register, tighter than either.

Underneath that sat two parallel answers to one question. `Figures` parses a
sentence and badges what it finds; `Lead` takes parts already split and badges
the ones marked as figures. `Figures` deliberately renders a bare fragment, so
it carries no typography and every caller invented a wrapper — four spellings
across the kit. The result a player sees: the same number is a boxed figure in
one sentence and an ordinary word in the next, and the sentence explaining a
service is harder to read than the sentence explaining a config, for no reason
either of them states.

## Decision 1: `Prose` states a sentence, `Lead` states a line of parts

`Prose` takes the sentence as a string, runs it through `Figures` and wraps the
result in `Typography`. `Lead` keeps the structured arm, for the counts, bands
and swatches the parser cannot find on its own (ADR-148).

Two entry points, one behaviour — not two mechanisms. The split is about what
the caller already knows: a roster string arrives whole, a viewmodel line
arrives in pieces.

`Prose` takes `as` because a service row renders inside a `<button>`, where a
`<p>` is not valid content, and `gain` because a sentence stating a term paints
its figures saffron rather than viridian. It takes no `variant`, because there
is one register (D3) and a second can be added when a second exists.

## Decision 2: `Figures` is the only string renderer

`Lead` renders a string part through `Figures` instead of a bare `<span>`. A
string that holds no figure splits into one part, so this is identical output
for every connective word in the kit; only a string already carrying a figure
changes, and that string was breaking ADR-066 by rendering it bare.

This is what makes D1 a split rather than a duplication: both arms badge by the
same rule, so a sentence cannot read two ways depending on which arm a screen
happened to reach for.

A figure the parser finds inside a string part takes no colour (ADR-066 D3),
while an explicit `{ figure }` part still defaults to pewter. The divergence is
left standing; ADR-066's rule is the one to converge on, not the default.

## Decision 3: one register, and the heading carries the hierarchy

Explanatory prose reads at `text-xs`, `leading-relaxed`, `text-theme-muted` —
a `prose` variant of its own on `Typography`, which stays the single owner of
text style. No `.ui.tsx` writes a font class for a sentence any more.

The config description gives up `text-theme-faint` to get there, so it is dimmer
than it was. That is the point: it was the only secondary line in the game
wearing a primary tone, and a reader comparing a config card to a service row
could not tell whether the difference meant anything. Size and weight already
separate a sentence from the heading above it; colour was saying it a second
time, inconsistently.

`hint` keeps its tighter leading. The two are different registers — `hint` is a
short mark inside a row, `prose` is a sentence that wraps — and merging them
would have re-spaced thirty call sites to settle three.

## Decision 4: a disabled sentence dims with its row, not on its own

A locked or unaffordable service already dims text and badges together through
the row's own `disabled:opacity-40`. `Prose` stays tone-agnostic and inherits
it. A dimmed flag on the sentence would be a second place to keep the disabled
look in sync, and it would drift.

## Consequences

- `ConfigFacts`' two hand-rolled class constants are gone. The state note moves
  from `leading-8` to the shared `leading-relaxed`, so it sits closer to the
  description it qualifies.
- A spec asserting a class on a prose line must reach the wrapper with
  `.closest("p")` or the `textIs` matcher — `getByText` returns the innermost
  element, which is now a `Figures` span.
- Two file-private components called `Prose` were renamed to say what they do:
  `CodeSpans` in `Question.ui.tsx` (it splits backticks, ADR-137) and `FactText`
  in `PollFacts.ui.tsx`.
- The other plain note lines in the kit — `Ledger`, `WarmBoot`, `DexPanel`,
  `ProfileRecord`, `ApprovalList`, `SlaPicker`, `LedgerRows`,
  `ProfileCollection` and `BandOutcomes`' footer — still render a raw string.
  They are the remaining ADR-066 gap and are not closed here.
