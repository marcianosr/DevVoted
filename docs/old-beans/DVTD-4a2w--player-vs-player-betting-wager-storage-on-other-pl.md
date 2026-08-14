---
# DVTD-4a2w
title: 'Player-vs-player betting: wager storage on other players'' outcomes'
status: draft
type: feature
priority: normal
created_at: 2026-06-04T15:17:40Z
updated_at: 2026-06-04T15:17:40Z
---

Introduce a social wagering mechanic: players bet **in-run storage** on the outcomes of *other* players' daily-poll answers. Adds a secondary loop on top of solo play, turns the community section into a market, and creates a meaningful sink/source for storage that doesn't require playing harder yourself.

## Why
- Currently the community section is *informational* (who answered, fastest, etc.) but read-only — no agency over other players.
- Players invest emotionally in seeing other players succeed/fail; betting makes that investment mechanical.
- New storage source (winning bets) and sink (losing bets) — increases the meaningfulness of every byte of storage.
- Creates **late-day engagement**: the deadline isn't just "answer the poll" — it's "lock in your bets before X answers."
- Reinforces the social-presence vibe DevVoted is already cultivating with borders, titles, AvatarPopover, awards.

## Bet types (initial set)

### Tier 1 — binary outcomes (simplest to ship)
- **Will-answer**: bets resolve on whether player X answers today before end-of-day. Yes/No.
- **Will-answer-correctly**: bets resolve on whether player X answers AND gets it fully correct. Yes/No.

### Tier 2 — derived from existing community-stats data
- **Time-bracket**: bet that player X answers within a time-bracket (e.g. <30s, 30s–2min, 2min+).
- **Will-be-fastest**: bet that player X wins the Fastest Responder award today.
- **Will-be-first-good**: bet that player X wins the First Good award.

### Tier 3 — speculative, post-launch
- **Streak survival**: bet that player X extends their run streak today (i.e. answers today AND already had a streak going).
- **Death watch**: bet that player X fails a pipeline gate today (controversial — could feel mean. Optional opt-out.)

## Economy
- **Currency**: in-run storage bytes. Can't bet archived storage (keeps the meta-loop separate).
- **Min bet**: 32KB (cheap enough to be exploratory; large enough that wins matter).
- **Max bet**: gated by `storageAvailable` — can't bet what you don't have.
- **Payout**: starts as 1:1 even-money. Later iterations could introduce odds based on historical success rate of the targeted player (e.g. betting on a 90% answerer pays less than betting on a 30% answerer).
- **House edge / loss to junk**: 5% of losing bets disappear into "junk" rather than going to the winner. Provides a sink for inflation; named consistently with existing StorageBreakdown.

## Resolution
- **Cutoff**: bets lock at the same moment as the daily poll closes (or at a configurable hour before).
- **Resolution job**: when the daily poll closes, a server-side process resolves all open bets, credits/debits storage, and writes outcomes to a `bet_outcomes` table for audit.
- **Notification**: winner sees a "+X storage from bet" line in their next page load; loser sees the loss similarly. Could surface in the storage breakdown or as a toast.

## Schema (sketch)
\`\`\`
bets (
  id,
  bettor_user_id,        -- who placed the bet
  bettor_run_id,         -- which run the storage came from
  target_user_id,        -- who they're betting on
  target_poll_id,        -- which daily poll
  bet_type,              -- 'will-answer' | 'will-answer-correctly' | 'time-bracket' | …
  predicted_outcome,     -- 'yes' / 'no' / specific bracket
  amount_bytes,          -- size of the wager
  placed_at,
  resolved_at,
  outcome,               -- 'won' | 'lost' | 'cancelled' | null
  payout_bytes           -- credited on win, 0 on loss
)
\`\`\`

## UI touchpoints
- New section on \`/daily-poll\` (post-answer carousel?) listing other players + 'Bet on this player' buttons.
- Bet placement modal: target player, bet type, amount slider, predicted outcome, confirm.
- 'My active bets' section: visible during the day, shows pending bets + their state.
- Resolution screen: end-of-day summary modal showing winnings/losses.

## Considerations / risks
- **Collusion**: two players could coordinate to manipulate outcomes (one always answers correctly, the other bets big on them). At small DAU this is real. Mitigations: max bet per target per day, anti-self-bet, scaled odds when the target's answer rate is >95%.
- **Mean dynamics**: 'Death watch' bets on someone failing could feel hostile. Make this opt-in or skip the tier.
- **Bet on yourself?**: probably disallow — eliminates collusion concern and prevents trivial self-funding.
- **Loss aversion at low DAU**: with 8 daily players, half of all bets target the same 2-3 people who always answer. Tier-2 bets (Fastest/First Good) provide more variety even at small DAU.
- **Pacing**: betting could overshadow the actual quiz. Cap bets per day (e.g. max 5 active bets at a time) to keep it as a side mechanic, not the main loop.

## Blocked by / depends on
- Stable run-storage accounting (already in place — \`getStorageInfo\`)
- Community stats query (in place — \`communityStats.queries.ts\` already returns the right data shape for tier-2 bets)
- Probably wants stable run scheduling (daily poll cutoff times) — verify the day-end resolution job hook exists or needs adding

## Open questions
- Same-day vs. multi-day bets? (recommend: same-day only for v1)
- Public vs. private bets? (other players seeing what's bet on them — could be motivating or creepy)
- Should bets affect the leaderboard or remain a separate stat? (recommend: separate to start)
- Animation/celebration on win? (defer to polish pass)
- Tax archive on payout? (recommend: no — keep in-run pure)

## Todo (high-level — not exhaustive)
- [ ] Lock initial bet-type set (tier 1 only for v1?)
- [ ] Schema + migration for \`bets\` table
- [ ] Bet placement server fns + handlers + transactional storage deduction
- [ ] Resolution job — runs at daily-poll cutoff
- [ ] UI: bet placement modal + 'My bets' section
- [ ] UI: resolution summary on next visit
- [ ] Anti-collusion guardrails
- [ ] Tests covering: bet placement, insufficient storage, double-bet on same target, resolution logic
