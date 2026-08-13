---
# DVTD-39k8
title: Title renders no font size at all — text-md is not a Tailwind class
status: todo
type: bug
priority: high
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T13:46:18Z
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
