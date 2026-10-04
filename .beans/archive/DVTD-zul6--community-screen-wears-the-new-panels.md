---
# DVTD-zul6
title: Community screen wears the new panels
status: completed
type: task
priority: normal
created_at: 2026-09-15T16:23:32Z
updated_at: 2026-09-15T16:29:10Z
---

The kanto community screen is the last screen still drawn with bare body-only panels under hand-rolled `<section>` headings, and the last one standing on a framed ground. Every other kanto screen now heads its panels with `Panel.Header` and lines its lists with `Panel.Rows`/`Panel.Row`.

Also: the Conversation section goes. It was a mock of a feed we are not building.

- [x] Screen goes `ground="bare"` like every other kanto screen
- [x] Your climb: `Panel.Header` (title, badge, standing) + body reading + footer note
- [x] Who showed up: header + one `Panel.Row` per band
- [x] Where everyone is: header + placeholder in the body
- [x] Standing out: header carries the summary and the Dex press; awards become lined rows, not a card grid
- [x] The five polls: keeps a plain section head (PollResult already wears the panel surface, so it may not nest)
- [x] Delete Conversation from the ui, the factory, the spec and proto-run
- [x] Specs and stories updated

## Summary of Changes

`CommunityScreen.ui.tsx` now heads every section with `Panel.Header` and lines its lists with `Panel.Rows`/`Panel.Row`:

- Your climb: header carries the title, the `4 of 5` badge and the standing; the reading sits in the body, the shop note in the footer. `CommunityClimb.swatch` went with the `SwatchChip`, since the panel header owns its own themed glyph and the screen already wears the gate colour.
- Who showed up / Standing out: one lined row each, counts and climber stacks trailing. The standouts card grid is gone; the Dex press moved into the panel header meta.
- Where everyone is: header plus the dashed placeholder, which shed its own background so it reads as an empty slot, not a second panel.
- The five polls keeps a plain section head: `PollResult` already wears `PANEL_SURFACE`, so a panel around it would nest panels.
- Screen defaults to `ground="bare"`, the last kanto screen to do so.

Conversation is deleted from the ui, the factory, proto-run and the spec.

Verified: `npm run lint` clean, `npm run build` passes, community spec 17 passing. Two failures in `gate.model.spec.ts` (floor rule) are pre-existing and untouched by this work.
