---
# DVTD-g1lo
title: The profile shows what others see and a border is tried on first
status: completed
type: feature
priority: normal
created_at: 2026-09-29T09:02:11Z
updated_at: 2026-09-29T09:08:57Z
---

**What:** Borders and titles are edited in one appearance tab. At its top, a preview shows how other players see you: your profile card, the byline on your polls, and your card on the climb map. Selecting a border shows it in the preview before you buy or wear it.

**Why:** Nothing on the page shows what visitors see, and pressing a border spends archive before you have seen it on yourself.

## Done when
- [x] Edit profile opens a single appearance tab that holds both borders and titles
- [x] The tab shows you as visitors see you on three surfaces
- [x] Selecting a border previews it without buying or wearing it
- [x] Wearing or removing a title shows up in the preview straight away
- [x] The ADR, wiki and changelog describe the tab

## Notes
Plan: /Users/marciano/.claude-work/plans/this-is-the-profile-serialized-leaf.md

## Summary of Changes

- `profileScreen.viewmodel`: `OWNER_TAB_IDS` is `["appearance"]`; `triedOnBorderOf` and `appearancePreviewFor` feed the card, byline and climber card from one `ProfileIdentity`.
- New `AppearancePreview.ui` (+ spec, story), `Appearance.ui` (slot stack) and `Appearance.component` (holds the try-on in local state).
- `BorderCard.ui`: the frame is a try-on toggle (`aria-pressed`, dashed fuchsia outline); the button still buys, wears or takes off. `BorderShop.component` clears the try-on after a buy or wear.
- `ProfilePage.component` renders the one tab; `EDIT_PROFILE` moved to `ProfileScreen.ui`.
- ADR-142, wiki 6.4/6.5/6.7, CHANGELOG.
- The byline preview credits the display name, because the owner identity carries no GitHub handle.
