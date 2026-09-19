# ADR-069: The build sits in a folded footer on the poll screen

## Status

Accepted — 2026-09-11 (Marciano, DVTD-uixi). Places the band ADR-068 left in
flow; counts the states [ADR-040](040-config-status-online-skipped-offline.md)
defines. Kanto only: `terminal-theme` keeps its build sidebar.

## Context

The kanto poll screen rendered the build third from the top, between the audit
strip and the trail. ADR-068 made the screen one column but left the band where
it was, so a build of any size pushed the question down the page and the thing
the player came to read arrived below the fold.

The band is also the wrong shape for that position. It is reference material
consulted between answers, not something read top to bottom on every poll.

## Decision 1: the build is a footer, pinned to the bottom

`BuildFooter` wraps `Build` in a `Fold` inside a `sticky bottom-0` footer, and
is the poll screen's last child. Shut it is one row. Open it is the band exactly
as it rendered before, chips, skipped fold and all.

`Screen`'s body column grew `flex-1` so it stretches to the section's floor.
Without that a short poll leaves the footer stranded mid-page with ground below
it, because `mt-auto` has nothing to push against.

## Decision 2: the shut row counts states, not slots

ADR-040 predicted this: "the fold header counts the states instead of configs
against slots; width lives on prep and the shop." The row reads a total and
four figures.

| Reading | Means | Colour |
|---|---|---|
| ready | a paid press is ready on this poll | cerulean |
| applies | online, in effect on this poll | viridian |
| offline | an audit is holding it down | cinnabar |
| changing | its figure moves on this answer | vermillion |

The first three partition the chip field, and a config that sells a press counts
as ready rather than applies. `changing` is an overlay on that partition,
not a fourth bucket: a config being online and its figure moving are independent
facts, and forcing them into one axis would hide one of them. A zero count draws
no badge. `skipped` is not counted here, because `Build`'s own inner fold
already prints it and two counts of the same thing read as two different facts.

Which configs are changing is answered on unfolding rather than in the shut row:
a changing config wears a vermillion badge on its chip.

The words are the ones already in the codebase. `consumable` was not coined
(ADR-015, retired: "No
consumable or item class"), and `passive` was left alone because
`gate/domain/configRole.model.ts` already spends it on the
conditional-versus-always-on axis.

## Decision 3: shut on phones, open on desktop, decided once at mount

`BuildFooter` reads `matchMedia("(min-width: 640px)")` once into `useState`,
the pattern `RunCommunity.ui.tsx` already uses. The `open` prop overrides it in
both directions. `Fold` stays uncontrolled after that: the native `<details>`
owns the flip, as it does everywhere else in the kit.

## Decision 4: the summary row stacks rather than overflows

`Fold`'s summary row was `flex` with no wrap, and its meta strip was `shrink-0`,
which pinned the strip at max-content width so its own `flex-wrap` could never
engage. Four figures beside a title ran off a phone. The row now wraps and the
strip can narrow, with `ml-auto` held back to `sm` so a wrapped strip is not
also shoved to the right edge. Every other `Fold` had the same latent overflow.

## Consequences

- The first `position: sticky` in the codebase, and the first hook in
  `src/ui/kanto-theme/`. The hook is a mount-time read of the viewport with no
  data behind it, so ADR-010's Tier 1 rule holds, but the kit is no longer
  hook-free and the next one will not look like a first.
- The guards in `startsOpen` return `true` under jsdom and SSR, so the footer
  renders open in every spec that does not pass `open` explicitly.
- `Build` lost `paying` and `ready`, which nothing derived and nothing named
  outside its own summary line, and gained `heading` so the `Fold` can carry the
  title instead of stacking a second one.
- `wrongCost` moved off `PollScreenProps` onto `QuestionProps` and onto the
  question's own facts row, beside the category badge. With it gone the trail
  row wrapped a single child, so `Trail` is now a direct child of the screen.
- `changing` has no producer. The other three map onto `configStatusFor`,
  `RunView.paidActions` and `RunView.offlineConfigs`, but nothing in the domain
  says a config's figure moves on the next answer. Wiring it means deriving it
  from `autoUpgradeRemaining`, a paid action's doubling fee, and the faucet
  approaching `FAUCET_CAP_KB`.

## Amendment: the words are `ready` and `applies`

The first build of this row shipped the readings as `usable` and `running`, and
counted `usable` as "not offline, and the focus category matches", which is
what `applies` means here, not what a press means. A five-config build on a poll
none of them could be pressed on still read "4 usable", so the word promised an
action the screen did not offer. `usable` also reads as a property of the config
rather than of this moment.

`ready` and `applies` split that: `ready` is something you can do now, `applies`
is something already happening to you. The partition and the `changing` overlay
are unchanged.

Both readings and the chip badges now derive from one function, `pollPressesOf`,
so a count can no longer promise a press the screen does not draw.
