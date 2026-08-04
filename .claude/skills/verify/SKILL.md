---
name: verify
description: Launch and drive DevVoted to verify run/game UI changes end-to-end in a real browser.
---

# Verifying DevVoted changes

## Launch

```bash
npm run dev   # port 3005 (vite.config.ts), ready in ~4s; probe with curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/proto-run
```

## Surfaces

- `/proto-run` — the whole run loop (configure → answering → gate report → shop)
  with NO auth and an in-memory engine. Start here for any `src/modules/run` change.
- Its **DEV RIG** bar (bottom of the answering screen) has shortcuts:
  "Answer right", "Answer wrong", "All right → gate", "All wrong → gate" —
  use them to reach the gate report and shop without answering 5 real polls.
- `/run/*` routes are the production flow but need Supabase auth; prefer proto.

## Gotchas

- Console always shows favicon/site.webmanifest 404s and a Tooltip-induced
  `<div>-inside-<p>` hydration error (Tooltip wraps children in a Paragraph).
  Pre-existing — don't attribute them to your change.
- Playwright MCP screenshots with relative filenames land in the **repo root**;
  delete them after reading (they pollute git status).
- Full-page screenshots include the footer + TanStack devtools button; viewport
  shots of the top usually capture the screen under test.
- Hover-dependent UI (previews, tooltips, popovers) must be driven with stepped
  mouse travel (`page.mouse.move(x, y, { steps: 20 })` via browser_run_code_unsafe),
  NOT `locator.click()`/`hover()` — those teleport the pointer and will pass
  flows that vanish under a real mouse (the sticky-preview bug shipped past a
  teleporting click). Also wait ~1s after `goto` before synthetic mouse events;
  React replays events queued mid-hydration and produces phantom interactions.
