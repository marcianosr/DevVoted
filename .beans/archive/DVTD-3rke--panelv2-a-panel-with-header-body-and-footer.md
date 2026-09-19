---
# DVTD-3rke
title: 'PanelV2: a panel with header, body and footer'
status: completed
type: task
priority: normal
created_at: 2026-09-14T09:47:21Z
updated_at: 2026-09-14T09:53:53Z
---

The kanto kit cannot express the shape the new-run mock asks for: a header row
(square glyph + lowercase label, meta pushed right), a body, and a footer cut
off by a rule.

`Panel.ui.tsx` is a bare chrome box, so every call site hand-rolls the three
parts: title rows are inline TITLE_ROW consts (Ledger, Header, Build, Registry,
ConfigdexPanel), footers are a local DIVIDER const plus a row (Upgrades,
ConfigInfo, Confirm), and PanelTable undoes the panel's own padding with
`-mx-4 -my-4` just to draw an edge-to-edge rule.

PanelV2 makes the regions first-class. The padding moves off the root onto each
region, so a rule spans the full width with no negative-margin hack.

Compound API (a new convention for this kit, which otherwise uses slot props):

    <PanelV2>
      <PanelV2.Header label="build" meta="0 of 4 slots" />
      <PanelV2.Body>...</PanelV2.Body>
      <PanelV2.Footer trailing={<Button ... />}>+ buy slot 5</PanelV2.Footer>
    </PanelV2>

Scope: component, stories and spec only. Panel, Build, Registry, ScreenFooter
and NewRunScreen are untouched. `V2` is a placeholder while both panels coexist.

## Todo

- [x] PanelV2.ui.tsx: root chrome + Header/Body/Footer regions
- [x] PanelV2.spec.tsx: chrome and region contract
- [x] PanelV2.stories.tsx: BuildPanel, RegistryPanel, ABarWithNoHeader, SideBySide
- [x] npm test, npm run lint, npm run build all green

## Summary of Changes

Three new files in `src/ui/kanto-theme/`, nothing else touched.

**PanelV2.ui.tsx** — `Object.assign(Surface, { Header, Body, Footer })`. The root
carries the chrome only (`rounded-2xl border-theme-faint bg-theme-faint`, plus
`overflow-hidden` so the rules do not break the corners) and holds no padding or
gap. Each region pads itself (`px-4`), so the header rule and the footer rule
reach the panel edges with no negative-margin hack.

Header owns its glyph (`size-2.5 rounded-xs bg-theme-muted`) rather than taking
it as a prop. `meta` and `trailing` are ReactNode pushed right with
`ml-auto shrink-0`, the idiom Ledger/Header/ConfigInfo already use. `className`
is on the root only, matching Panel: no tailwind-merge here, so a region-level
override would lose to source order.

**PanelV2.spec.tsx** — 9 tests. Pins the chrome (and that it is not
`bg-theme-raised`), that padding lives on the regions and not the surface, the
header bottom rule and footer top rule, the `ml-auto` pushes, and that a panel
renders with body only.

Note: an earlier draft queried the regions by ARIA role and passed. That was
wrong. A `header` element is only a `banner` landmark when it is NOT inside
article/aside/main/nav/section; ours is inside a `section`, so a real browser
exposes `generic`. jsdom's dom-accessibility-api does not implement that
scoping, so the test was green against a role the browser never produces. Now
queried by element, matching the container-query precedent in AnswerDiff.spec
and BandOutcomes.spec.

**PanelV2.stories.tsx** — `Kanto/PanelV2`: BuildPanel, RegistryPanel,
ABarWithNoHeader, SideBySide. Built from Typography/Badge/Button/SlotBox only;
ConfigChip was skipped so the story stays about the chrome. Copy uses the app's
real strings (NEW_RUN_REGISTRY_NOTE, the ScreenFooter line) rather than the
mock's paraphrase.

## Verification

- `npm test` — 4301 passed, 6 skipped, 2 todo; PanelV2.spec 9/9.
- 4 failures in `PollScreen.spec.tsx` and `gate.model.spec.ts` are PRE-EXISTING
  on this branch: both files are unmodified at HEAD, and the same 4 fail with
  the PanelV2 files moved out of the tree entirely.
- `npm run lint` — clean (the one warning, an unused `gate` param in
  Screen.stories.tsx, is pre-existing). `lint:arch` no violations, 982 modules.
- `npm run build` + `npx tsc --noEmit` — 0 errors repo-wide.

## Open

Compound subcomponents are a NEW convention for this kit, which otherwise uses
slot props. Possibly worth an ADR before a second component copies it.

The mock renders header meta figures (`0 of 4 slots`) as plain muted text, which
reads against ADR-066 "every figure wears a badge". `meta` takes a ReactNode, so
a call site can pass a `Figures`; worth settling when real screens migrate.
