---
# DVTD-v8e3
title: 'Special titles: replace the roster (batch 1)'
status: completed
type: feature
priority: normal
created_at: 2026-09-29T12:16:02Z
updated_at: 2026-09-29T12:25:36Z
---

**What:** The special titles become eleven new ones, from Hello, World! to WONTFIX, replacing the eight that were there.

**Why:** The new roster names moments a player recognises from their own runs, which the old one mostly did not.

## Done when
- [x] Hello, World!, And now it's green!, It Compiles, Ship It, 10x Engineer, Stack Overflow, Tested in Production, Dependency Hell, Clean Install, I'm a Teapot and WONTFIX can each be earned
- [x] The eight old special titles are gone, and nobody still wears or holds one
- [x] The wiki and changelog name the new roster

## Notes
- Decisions: exactly OK for Ship It; 10 coverage units for 10x Engineer; any run's first answer for Hello, World!; It Compiles reads the existing runs-won counter.
- Ship It and Stack Overflow reuse their old ids; the migration clears them so nobody holds the new ones for the old requirement.
- bare-build-clear loses its only reader and is deleted.

## Summary of Changes
- Ten one-shot metrics emitted in objectiveProgress.model; It Compiles reads runs-won.
- BEHAVIOUR_TITLES replaced by the eleven; bare-build-clear deleted.
- Migration 20260929160000_replace_special_titles clears the eight old ids (worn array first), with a spec.
- Fixtures moved to new ids; ADR-146, ADR-134 D5 pointer, wiki table, changelog entry.
- Stack Overflow reads the overflow payout rather than raw units, so a sub-KB surplus does not count.
