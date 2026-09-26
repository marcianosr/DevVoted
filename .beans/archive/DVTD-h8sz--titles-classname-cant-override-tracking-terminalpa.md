---
# DVTD-h8sz
title: Title's className can't override tracking — TerminalPanel's 0.3em letter-spacing never applies
status: scrapped
type: bug
priority: normal
created_at: 2026-08-13T19:56:30Z
updated_at: 2026-08-20T09:03:03Z
parent: DVTD-82c4
---

Found while fixing DVTD-39k8, same failure mode: a class sitting in the markup that does nothing.

`Title` puts `tracking-tight` on its cva base. `TerminalPanel.ui.tsx:13` passes `className="tracking-[0.3em]"` to widen it into a terminal-style heading. Both are single-class selectors in the same layer, so **specificity is equal and source order decides** — and `clsx` order in the `class` attribute is irrelevant to the cascade.

Measured in the production CSS (`app-BEGExFBT.css`):

```
.tracking-\[0\.3em\]{--tw-tracking:.3em;letter-spacing:.3em}   @ byte 39118
.tracking-tight{--tw-tracking:var(--tracking-…)}               @ byte 39177
```

Tailwind emits the arbitrary value **first**, so `tracking-tight` wins and the panel's headings render tight, not spaced. Pre-existing: `tracking-tight` has been on Title's base since b4d33a2, so this has never worked.

Same class of trap for any `className` a caller passes that collides with a base utility — colour and size are now covered by the `tone` prop and the `as`-driven size scale (DVTD-39k8), but tracking is not.

## Options

- `tailwind-merge` on the primitives, so the caller's class wins by construction. One dependency, fixes the whole family at once.
- A `tracking` variant on `Title` (`tight` | `wide`), keeping the escape hatch typed like `tone` and `as` now are.
- Drop `tracking-tight` from Title's base and let it inherit `app.css`'s `letter-spacing: 0.01em`.
- Decide the terminal panel does not want 0.3em after all — it has rendered tight for weeks and nobody filed it.

## Todo

- [ ] Pick one of the four
- [ ] Check whether any other `className` on a design-system primitive collides the same way
