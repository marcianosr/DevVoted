---
# DVTD-39k8
title: Title renders no font size at all — text-md is not a Tailwind class
status: todo
type: bug
priority: normal
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T15:37:32Z
parent: DVTD-82c4
---

`src/ui/typography/Title.component.tsx:16`:

```tsx
<Tag className={clsx("text-md tracking-tight text-zinc-200", className)}>
```

`text-md` does not exist. The Tailwind scale is `text-sm` / `text-base` / `text-lg`, no `--text-md` token is defined in the `@theme` block (`src/styles/app.css:95-119`), and `tailwind.config.mjs` sets only `content` and `darkMode`.

So **`Title` emits no font-size**, and `as="h1"`, `as="h2"` (7 sites) and `as="h3"` (4 sites) all render identically. The heading level is semantic only; it has no visual weight.

Measured consequence: **14 of 36 `<Title>` call sites pass a `className` override**, and 6 of 18 `<Subtitle>` sites do. Four of those overrides are tone, not size (`text-cinnabar` twice, `text-gradient-green`, `text-zinc-100`) — re-expressing in raw Tailwind what `Paragraph` models as `tone=`. For comparison, `Paragraph` has 162 call sites and 84 `className` overrides.

Related but separate: **DVTD-8ksp** notes that Title's `text-zinc-200` disagrees with `ParagraphTone.default`'s `text-zinc-100`, and that Subtitle's `className` escape hatch has zero callers. The tone half belongs there; this bean is the missing size scale.

## Todo

- [ ] Give `Title` a real size scale tied to `as`, or an explicit `size` prop
- [ ] Give `Title` and `Subtitle` the shared `tone` vocabulary
- [ ] Remove the `className` overrides the two changes make redundant
- [ ] Check the visual diff — every heading in the app changes size when this lands

## Priority re-graded (2026-08-13, same day it was filed)

High → normal. The dead class is real, but the symptom is **latent**: the app has been designed and playtested for weeks with `Title` at inherited size, so the current look *is* the intended look as far as anyone has experienced it. Nothing is visibly broken to a player, and no fix restores a known-good state — someone has to **decide** what the sizes should be, which makes this a design task with a defect at its root rather than a bug to repair.

The genuinely bug-shaped part is narrower: `as="h1"` and `as="h3"` are announced as different levels by a screen reader while rendering identically, so the heading hierarchy assistive tech reports does not match the one a sighted reader perceives. Real, mild, and the reason this stays on the list rather than being scrapped.

### Also affected, found while re-checking

`text-md` appears at **7 more sites**, all in `src/routes/__root.tsx` nav items (`:152, :160, :168, :177, :261, :268, :293`) — `className="... px-4 py-2 text-md hover:bg-gray-800"`. Same dead class, same silent no-op. That file is legacy Tier-2 markup awaiting **DVTD-wj1t**, so sweep it in the same pass or leave it to the migration, but do not fix `Title` alone and assume the class is gone.

Confirmed not defined: no `text-md` in `src/styles/app.css`, no `--text-md` token in its `@theme` block, and `tailwind.config.mjs` sets only `content` and `darkMode`.
