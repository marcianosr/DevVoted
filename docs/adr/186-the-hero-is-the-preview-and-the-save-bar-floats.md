# ADR-186: The hero is the preview, and the save bar floats

## Status

Accepted — 2026-10-04 (Marciano, DVTD-jsun). Amends ADR-142 (the tab leads with a
preview card) and ADR-144 (a look is a draft saved in one press); amends ADR-180
for your own page (no trophies) and ADR-129 (no `you 6` beside a visitor's trophies).

## Context

The Appearance tab drew its own preview card, then the pickers, then the save
press in a footer. The hero at the top of the page already wore the draft, so the
card was said twice, and the save press scrolled away with the tab.

## Decision 1: the hero is the one preview

The Appearance tab draws no card of its own. While the draft differs from the
saved look, the hero takes a saffron ring and reads **preview · not saved** in
its corner; while a border is tried on, **trying on Merge Conflict · not saved**.
`previewLabelFor` owns the string.

## Decision 2: a floating save bar, on every tab

While the look is unsaved, a bar floats at the bottom of the screen on every tab:
**Unsaved look · the card above is a preview · discard · Save look**. Discard
drops the draft and any try-on (`useLookDraft.discard`). It lives on the page,
not in the tab, because the Borders tab drafts too.

## Decision 3: one picker panel, swatch first

The tab is one panel: Swatch ("sets the colour of your card"), Titles ("up to 3 ·
the first shows everywhere"), Border ("2 of 33 owned"). The edit-profile press is
gone: Appearance is the tab the page opens on.

## Decision 4: your own hero carries no trophies

Deepest gate, swatches and runs won leave your own hero; a visitor still reads
them (ADR-129).

## Decision 5: the hero glows, and a visitor's trophies are tiles

The hero's head wears the same glow as the climb map's card (a gradient from the
page's swatch colour), and a visitor reads their record as
tiles (`StatTiles`, shared with `Standing`): deepest gate, runs played, runs won,
best streak (the longest run streak in any category, `fetchBestStreakOf`), best
category and archived storage, closed by a full-width row of the swatches held. The viewer's own
figure (`you 6`) is no longer stated beside them: the tiles read as the player's
record, not a comparison.
