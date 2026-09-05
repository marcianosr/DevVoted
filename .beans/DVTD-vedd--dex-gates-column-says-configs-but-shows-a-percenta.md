---
# DVTD-vedd
title: Dex Gates column says configs but shows a percentage
status: todo
type: bug
priority: normal
created_at: 2026-09-04T15:20:57Z
updated_at: 2026-09-04T15:20:57Z
---

`src/ui/modern-theme/screens/GatesPanel.ui.tsx` legend (line ~85) labels the column **"configs a miss peels"**, but the value it renders is a **percentage share**: `GatesView.component.tsx:60` maps `peels: Math.round(entry.peelShare * 100)`.

So the routed Dex tells a player gate 3 peels **"−25 configs"** when it means 25% of the build. Gate 11 reads "−35 configs".

Found while shipping DVTD-ej8m (ADR-057). Not fixed there: my change only needed the `peels === 0` guard (Pallet would otherwise have rendered `+0`, since `signed(-0)` returns `"+0"` because `-0 < 0` is false). Redefining the column's unit is wider than a boy-scout fix and is a Dex design call.

The wiki's own gate table (§2.8) states this column as a **share** ("20%"), which is the likely correct reading.

## Todos
- [ ] Decide the unit: share (matches the wiki and the domain field `peelShare`) or an actual config count
- [ ] If share: relabel to "share a miss peels" and render `{peels}%`; keep "none" at 0
- [ ] Update `GatesPanel.spec.tsx` — "writes the peel count as a loss, with a minus sign not a hyphen" (pins `"−2"`), "reddens only the peel counts an audit inflated", and the legend-label assertion at :122
- [ ] Check `GatesPanel.stories.tsx:68` still reads correctly
