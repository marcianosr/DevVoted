---
# DVTD-i32n
title: 'Design system: pixel typography + Kanto category colors (Storybook)'
status: completed
type: feature
priority: normal
created_at: 2026-07-12T08:20:00Z
updated_at: 2026-07-12T08:28:26Z
parent: DVTD-5jpw
---

src/ui/theme/categoryColor.ts (CategoryCode -> Kanto CSS var per ADR-007). src/ui/typography/: Title (text-3xl), Subtitle (text-lg zinc-300), Paragraph (white), pixel font. Stories under new 'Design System/' container.

## Summary of Changes
- src/ui/theme/categoryColor.ts — CategoryCode → Kanto CSS var (categoryColor) + token name (categoryColorToken), per ADR-007 table.
- src/ui/typography/: Title (text-3xl bold, optional Kanto accent), Subtitle (text-lg zinc-300), Paragraph (base white). Pixel font inherited from body.
- Stories under new 'Design System/' container: Typography/{Title,Subtitle,Paragraph} + Category Colors swatch reference.
- tsc + oxlint clean.

## Correction: use app.css as source of truth
app.css already maps categories via [data-category-theme] → --theme-color + .text-theme/.bg-theme/.border-theme utilities. Removed the duplicated (and mis-guessed) TS color map. New: src/ui/theme/categoryTheme.ts (spread onto a scope). Title takes a 'category' prop that self-themes. ADR-007 §1 corrected with authoritative pairs.
