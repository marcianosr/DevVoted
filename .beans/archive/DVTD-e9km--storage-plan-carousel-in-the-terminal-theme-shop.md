---
# DVTD-e9km
title: Storage plan carousel in the terminal-theme shop
status: completed
type: feature
priority: normal
created_at: 2026-09-03T14:52:41Z
updated_at: 2026-09-03T15:04:53Z
---

Replace the terminal-theme StoragePlan meter (held+next) with a CSS scroll-snap carousel of all seven rungs per Marciano's mock. Held rung centered on open (one-time scrollLeft on mount, ClimbToday precedent); rungs above held+1 masked as ????; each card carries the cap, a 'current' chip, one USP bullet (the rent), and a select press. Unaffordable upgrade stays disabled with the refusal line; downgrades warn what they burn; a locked shop disables every press. Meter stays below the carousel with a visible caption.

- [x] StoragePlan.ui.tsx: new cards+meter props, header with description and 'billed at the gate check', carousel, MaskedCard, centering effect
- [x] ShopView.component.tsx: storagePlanProps maps all options (revealed = tier <= heldIndex+1)
- [x] ShopView.spec.tsx: rewrite storage plan describe block
- [x] StoragePlan.stories.tsx: six carousel stories
- [x] screens/ShopScreen.stories.tsx: reshape four plan blocks
- [x] CHANGELOG.md entry (supersedes the unshipped 'meter now, not a menu' line)
- [x] Docs boyscout: ADR-046 l.82 and wiki glossary 512KB -> 256KB
- [x] lint + test + build green

## Summary of Changes

- `StoragePlan.ui.tsx` rewritten: `{cards, meter}` props, scroll-snap track (`snap-x snap-mandatory`, `snap-center` cards, `w-44`), MaskedCard via `Redacted` for unrevealed rungs, one-time scrollLeft-on-mount centering on the held card (ClimbToday pattern, jsdom-safe), CapMeter kept below with a visible caption (`1.2 MB held · 819 KB free · 2 MB cap · +1 MB on 3 MB`). `RentText`/`StorageRung` exports untouched (Dex StoragePanel dependency).
- `ShopView.component.tsx` `storagePlanProps` maps every `StoragePlanView` option to a card: `revealed = tier <= heldIndex + 1`, refusal `bills X a gate, you hold Y` on the revealed-unaffordable rung, `onSelect` withheld for held/locked/unaffordable/unrevealed.
- `ShopView.spec.tsx`: seven new/updated tests (7 listitems, masking, meter label, select dispatch, refusal, burns, read-only select disabled). 44/44 green.
- Stories: six new StoragePlan stories over the real `STORAGE_PLANS`; the four screen-story `plan:` blocks share one fictional `STORY_LADDER`. Verified with a scratchpad tsconfig clearing the stories exclusion (tsc exit 0).
- CHANGELOG Unreleased: the unshipped meter entry rewritten as the card-rack entry.
- Docs: ADR-046 stale 512 KB clamp/free-cap lines -> 256 KB; wiki glossary same; wiki storage-plan section gained the reveal rule and select-press wording.

Verification: lint clean (one pre-existing hand.model warning), `npx tsc --noEmit` exit 0, tests 2648 passed with 8 pre-existing failures in branch-WIP files (hand.model.spec, modern-theme RewardScreen.spec) unrelated to this bean.
