---
# DVTD-5z5z
title: New run screen stands its panels on the page
status: completed
type: task
created_at: 2026-09-14T10:27:07Z
updated_at: 2026-09-14T10:27:07Z
---

The new run screen sheds the single card it used to sit inside, so its three
PanelV2 sections stand on the page as separate boxes.

`Screen` gained `ground?: ScreenGround` ("framed" | "bare", default "framed").
"bare" drops background, border and rounding together: an outlined card with no
fill is just an empty frame, so all three go at once. Width and the p-4/sm:p-8
frame padding stay, because it is still a screen.

`NewRunScreen` defaults `ground` to "bare". That default lives on the SCREEN,
not on StartView.component: "the new run screen is bare" is a fact about the
screen, not about the route wiring. Every other kanto screen is untouched
because Screen still defaults to "framed".

## Todo

- [x] Screen: ground flag, bare sheds bg + border + rounding
- [x] NewRunScreen: default to bare, pass through
- [x] Screen.spec: bare sheds the frame, keeps width and padding
- [x] NewRunScreen.spec: the default renders unframed
- [x] story: Framed, for comparison against the new default
- [x] CHANGELOG amended (same unreleased entry, not a second one)
- [x] test, lint, build green

## Summary of Changes

One live mount: `src/routes/proto-run.tsx:513` renders `StartView`, which
renders `NewRunScreen`. Defaulting the screen covers it.

`NewRunScreen.stories.tsx`'s `SeparateTerminals` became `Framed` — the story now
shows the OLD reading, since the new one is what every other story renders.

## Worth knowing

Nothing in the kanto kit sets `data-gate-theme` on `<body>` (only `old-theme`
does, via a useEffect), so behind a kanto screen the body is plain
`bg-zinc-950` from app.css:30. `bg-theme-faint` is L 0.10 against zinc-950's
~0.14, so the panels are DARKER than the page: they read as tinted wells sunk
into it, not as cards floating above it. Marciano saw the story and wanted it.

If a future pass wants panels standing proud instead, the lever is
`bg-theme-raised` (L 0.22) on PanelV2 — currently forbidden by
`Panel.spec.tsx:22` on the rule that a panel is delineated by its edge, never by
a lighter fill. That is a deliberate decision, not a quiet swap.

## Verification

- `NewRunScreen.spec.tsx` 28/28, `Screen.spec.tsx` 48/48.
- `npm test` — 4307 passed, 6 skipped, 2 todo. The 4 failures in
  `PollScreen.spec.tsx` and `gate.model.spec.ts` are the same pre-existing ones
  proven unrelated under DVTD-3rke.
- `npm run lint` clean, `lint:arch` no violations, `npx tsc --noEmit` 0 errors.
