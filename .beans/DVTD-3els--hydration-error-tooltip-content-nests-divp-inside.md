---
# DVTD-3els
title: 'Hydration error: Tooltip content nests div/p inside Paragraph <p> (ConfigChip)'
status: todo
type: bug
created_at: 2026-07-31T14:20:22Z
updated_at: 2026-07-31T14:20:22Z
---

Seen on /proto-run configuring screen (browser console), but the broken markup is in Tier-1 UI, so it affects every screen rendering ConfigChip tooltips.

React reports: "In HTML, <div> cannot be a descendant of <p>" and "<p> cannot contain a nested <p>", followed by a full hydration failure (tree regenerated on the client).

Chain: ConfigChip → Tooltip renders its content (a <div>, containing another Paragraph/<p>) inside a Paragraph, which renders a <p>. Invalid HTML nesting → SSR/client mismatch.

Likely fix: Tooltip's wrapper should not be a Paragraph/<p> (use a span-based surface), or tooltip content must be phrasing content only.

- [ ] Reproduce: open /proto-run, check console on the configuring screen
- [ ] Fix nesting in Tooltip/ConfigChip (Tier 1, src/ui)
- [ ] Confirm hydration error gone on /proto-run and /run
