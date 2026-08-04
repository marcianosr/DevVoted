---
# DVTD-95k3
title: 'Community board v2: per-option results with who-picked-what'
status: completed
type: feature
priority: normal
created_at: 2026-08-04T16:55:31Z
updated_at: 2026-08-04T20:02:07Z
parent: DVTD-h175
---

Rebuild /run/community per Marciano's mock: per poll, each option is a row with count + percentage, a progress bar (highlighted for the correct option, dimmed at 0), and beneath it the voter chips (initials avatar + name, viewer shown as 'you' first). Header: 'Community' + 'N players answered today'; per-poll subline 'X of Y got it right · you were one of them'. Shop (and strip) detour button relabeled to Community. Skeleton slice toward DVTD-wii3 — profile borders and top committers come later.

- [x] Handler: reshape RunCommunityPollDetail to a per-option breakdown (label, isRight, count, percent, voters, yours); keep redaction (past-only polls, missed stays sealed)
- [x] Handler spec covers the option breakdown + viewer-first ordering
- [x] Rebuild RunCommunity.ui.tsx board to the mock (no card chrome, design-system primitives) + board spec
- [x] Update stories; relabel shop/strip rightAction + page title
- [x] Changelog + wiki; lint + tsc + tests green

## Summary of Changes

- `community.handlers.ts`: `RunCommunityPollDetail` reshaped to `{ answerType, answeredCount, gotItRightCount, youGotItRight, options: CommunityOptionResult[] }`; each option carries label, `isRight` (named to survive the no-"correct":-key tripwire), count, percent, `yours`, and voters (viewer first, `you: boolean` on CommunityVoter). Dropped agreedPercent/voter-bucket fields the old board used.
- `RunCommunity.ui.tsx`: full rebuild to the mock — per-poll sections (question + "X of Y got it right · you were one of them" + "multiple answers" hint), option rows with count/percent, celadon bar for the right answer, dimmed zero rows, voter chips with identity-stable tone hash and "you" in cerulean. OutcomeTile grid, AgreementBar, expand state all gone. New `RunCommunity.spec.tsx` (6 tests) + stories rewritten.
- Added `cerulean` to ParagraphTone (design-system gap; old page hand-rolled text-cerulean).
- Shop/strip detour label "How you compared →" → "Community →"; page title/empty state renamed; RunLayout spec updated.
- Wiki §7.2 rewritten (The Community Board); CHANGELOG unreleased bullets amended.
- Verified: 1028 tests / 108 files, oxlint + depcruise + tsc clean.

Deferred (per DVTD-wii3): profile borders on chips (schema has photo_url + equipped_border_id; fetchSessionAnswersForDay selects neither yet), top committers awards (DVTD-smye).

Verified in-browser (2026-08-04, autonomous tick): FullGate story screenshot matches the mock — celadon bar on the right answer, counts/shares, viewer-first chips, dimmed zero rows, sealed skipped poll, percentile footer. Only console noise was the known Storybook favicon 404.

Follow-up (same day, Marciano): slimmed the board — progress bars removed everywhere; voter names removed from the row and moved into the chip tooltip (hover / tap via tabIndex focus). Tooltip gained a `compact` fit-content variant (new Compact story). Chips overlap (-space-x-1) like the reference mock. Board spec updated; hover verified in Storybook with stepped mouse travel.

Follow-up 3 (same day, Marciano): one-line option rows for vertical density (10-answer polls stay scannable) — voter chips moved inline right next to the count; percentage text removed; the "X of Y got it right · you were one of them" subline removed (rightLine helper deleted). Payload still carries percent/gotItRightCount/youGotItRight/answerType — UI-only removal, fields kept while the design settles.

Follow-up 4 (same day, Marciano): mobile fold + density pass. Each poll is a fold (question row = toggle button with inline chevron, FoldableRow-style useState in the .ui file): starts FOLDED under 640px via a mount-time matchMedia check (client-only render makes that safe; jsdom/SSR guards default open), open on desktop. All Paragraphs dropped size="sm" to the xs default; chips h-7 → h-6; board/section/list spacing tightened (space-y-5/2/1). Fold covered by spec; verified in 375px and 1200px viewports.

Follow-up 5 (same day, Marciano): folded poll rows show "X% had it correct" (celadon percent, muted text) before the chevron; hidden while open (the checkmark row already tells it). Uses gotItRightCount/answeredCount kept in the payload earlier. Spec asserts 40% on fold, absent when open.

Follow-up 6 (Marciano): chips now render via the shared domains/users Avatar.component (photo or identity-colored initial) instead of a bespoke AvatarDot — VoterAvatar wraps it in the you/zinc ring; Avatar gained a noTitle prop (native title clashed with our Tooltip); CommunityVoter carries photoUrl (query selects users.photo_url). ROOT-CAUSE FIX riding along: Tooltip now wraps children in a span, not a <p> — kills the known div-in-p hydration error class (Avatar renders a div). Arch allows modules → domains component import.

Follow-up 7 (Marciano): category swatch next to each community question, mirroring the answer review (categoryTheme on the section + Swatch sm; RunCommunityPoll gains category: CategoryCode | null — null for missed polls, so sealed rows reveal no category; fetchPollsWithOptions selects category_code). Plus a faint "multi" marker after multiple-answer questions on BOTH surfaces (community board + AnswerResults review) — Badge was too chunky for xs rows.
