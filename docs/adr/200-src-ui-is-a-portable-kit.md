# ADR-200: src/ui is a portable kit

## Status

Accepted. 2026-10-16 (Marciano). Amends [ADR-010](010-ui-layer-separation.md): `src/ui/kanto-theme/` holds primitives only, not the screens built from them.

## Context

`src/ui/kanto-theme/` grew into one flat folder of 126 visuals. About 35 are primitives
(Button, Panel, Badge, Typography, Modal, the form fields). The rest are the game:
Audit, Balance, BandLadder, ConfigChip, the five run screens, the Dex, the profile.

That has two costs. A game visual cannot call its own domain at runtime, because
`ui-stays-presentational` allows only type imports from modules, so helpers get
inlined or fixtures get routed through `src/test`. And the kit cannot be reused,
because its primitives know about `GateSwatch`, `AnswerType` and the copy file.

## Decision 1: a visual that names a game concept lives with that concept

Any `.ui.tsx` that renders a DevVoted concept moves to the `presentation/` folder of
the aggregate that owns the concept (ADR-002). ConfigChip goes to `run/config`,
Swatch to `run/gate`, the Dex tabs to `collection/dex`. A screen that composes several
aggregates lives with the aggregate whose route mounts it. Cross-aggregate
`presentation → presentation` imports are already allowed.

## Decision 2: the kit imports nothing from DevVoted

`src/ui/` may not import from `src/modules/`, types included, and may not import the
game-specific files in `src/shared/lib/` (copy, storage, categories, profilePath,
answerTypes). Generic helpers (syntax highlighting, code spans) stay allowed. A kit
part that needs a game value takes it as a prop or a slot: Action takes a `leading`
node instead of a swatch, and Screen takes any `gate-*` theme name instead of the
gate roster's type. dependency-cruiser enforces this (`ui-is-a-portable-kit`).

Stories are exempt. A kit story may show a primitive around a game part, the way
the Modal story frames Uninstall.

A part whose props carry game meaning moves even if it looks generic. Keycap draws
single, multiple and pairs answers, and NewBadge states "new for this account", so
both live in `run/run`.

## Decision 3: the app shell is its own aggregate

The nav, the footer and `useNavRun` belong to no game concept. They live in
`src/modules/app/shell/presentation/`.

## Consequences

- A game visual can import its domain helpers directly. The type-only workarounds go.
- The kit could be copied into another project with `kanto.css`, its stylesheet. Game
  rules live in `.css` files beside the components that use them.
- A viewmodel that borrowed copy or a helper from a `.ui.tsx` now owns it, because
  `application/` may not import `presentation/` at runtime. The coverage band
  colours and words live in `run/build/application/coverageBand.viewmodel.ts`.
