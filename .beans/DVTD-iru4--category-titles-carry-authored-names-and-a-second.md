---
# DVTD-iru4
title: Category titles carry authored names and a second rung
status: in-progress
type: feature
priority: normal
created_at: 2026-09-28T11:50:45Z
updated_at: 2026-09-28T12:36:44Z
---

**What:** Every category has two earned titles with written names, one for turning up and one for getting it right.

**Why:** Twelve titles all called "<Category> Maintainer" name nothing, and the names from the game that came before DevVoted already exist and already say something.

## Done when

- [ ] Each of the twelve categories has an entry title and a mastery title, both hand-named
- [ ] The entry title is earned by answering enough polls in that category, the mastery title by getting enough right
- [ ] Nobody loses or cannot take off a title they already wear
- [ ] Players who answered before this shipped start from their real count, not from zero
- [ ] The wiki and the changelog state the new roster

## Notes

The nineteen names come from the calendar-era app, where each was awarded to whoever had the *most* of something. That reading cannot come back: a title is a threshold on your own record (wiki 6.6) and the comparative axis belongs to the twelve category seats, which deliberately carry no title (ADR-103 D3). The names survive, the requirements do not.

Seven of the nineteen are already entry/mastery pairs (HTML Hobbyist + Markup Master, CSS Carrier + CSS Connoisseur, and so on). Five categories have no name yet; four drafts are lifted from `docs/old-beans/DVTD-vje6` and Vue is new.

**The ids must not move.** `users.equipped_title_ids` is a bare `text[]` with no foreign key to `user_titles`, and both the equip and the unequip service send the whole array back, so one id with no matching row blocks both while rendering no row to click. Seeded accounts already hold `title-maintainer-js` and `title-maintainer-git`. This is a rename of the `name` field only.

Roster grows twelve to thirty-one. Worn cap stays three.

Files: `src/modules/account/profile/domain/title.model.ts` (the roster), `src/modules/run/config/domain/configUnlock.model.ts` (the metric union), `src/modules/run/run/domain/objectiveProgress.model.ts` (one emission line), plus a guarded backfill migration so existing counters are not zero.

Plan: `~/.claude-work/plans/i-had-these-old-enchanted-rabbit.md`

## Second pass — how you play, and the rank

**What:** A second roster names how you play rather than what you know, and the old rank ladder comes back as a derived line on your card.

**Why:** The engine was already counting twenty-four facts about every player, for life, and only two of them fed a title.

- [x] Twenty-nine titles over builds, volume and behaviour, six of them unflattering
- [x] A run-wide streak, a bare-build clear, and nothing else newly emitted
- [x] The fourteen ranks return, derived and never stored, rescaled for five polls a day
- [x] No title name collides with a config label, and a spec says so
- [x] The card shows the rank on both your own page and a visitor's

### Notes

The rank is not a title and the old data already said so: it was tagged `rank` where the others were `award`. A rank replaces the one before it, a title accumulates and is permanent, so stored as titles everybody would end up holding all fourteen with "voted less than 7 times" on the shelf of a player with thousands of answers.

`Cold Starter` collided with the `Cold Start` config and is now `Checked Exception`. The guard added for it matches exactly, so it catches duplicates rather than near-misses; that one was caught by reading.

A one-shot metric is no longer exclusively an unlock's, so the completeness guard that asserted every one-shot belonged to a config or service moved to the title spec, where both consumers are visible.

Roster is fifty-nine titles. Worn cap stays three.
