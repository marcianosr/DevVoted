# ADR-123: The coverage meter can go dark, the panel cannot

## Status

Accepted — 2026-09-26 (Marciano, DVTD-t8pg). Ships **500 Internal Server
Error**. Amends [ADR-106](106-the-poll-screen-reads-coverage-in-units.md) and
answers the layout condition [ADR-113](113-the-poll-screen-stands-coverage-beside-the-question.md)
set.

## Context

Every audit that withholds something withholds something about the *question*.
404 hides the category, 207 hides the answer type, 451 seals answers and sells
them back. Nothing has ever withheld the player's own numbers.

ADR-106's Context rejected hiding the coverage percent, but the proposal it
rejected was to hide it **until Boulder** — permanently, on a gate boundary, to
paper over the re-base that made a clear read as a punishment. Removing the
baseline was the objection, and it was the right one.

Hiding the reading for four answers of one window is a different thing. The
baseline is not removed; it is handed back inside the same gate, and the
player's own receipts still itemise what each answer earned.

## Decision

1. **An audit may darken the coverage reading for the window's opening polls.**
   `blindPolls` names how many, folded by `auditsHideMeter(audits, answeredBefore)`
   in the shape `auditTimeLimitMs` and `auditRedactionPerPoll` already use.
   500 sets 4, so the reading returns for the fifth answer.

2. **Scoring is untouched.** Nothing in `answerPayoutFor` reads it. 500 is the
   first audit whose entire cost is that the player cannot see, which is why it
   is drawn from gate 3 on while 425 and 510 wait.

3. **The panel stays; its contents go.** ADR-113 fixed the poll screen as a
   fluid question column beside a 24rem rail. Dropping the rail mid-window would
   reflow the screen under a player who is mid-answer, so `PollCoverage` becomes
   `Redactable<PollReadout>`: the panel keeps its place, its width, its heading
   and its "what a poll pays" tooltip, and draws `???` where the track was.

4. **Everything that restates the figure goes with it.** The band badge, the
   lead line, the spoken reading, the live region and the gate's units row are
   all the same number in another form; the units row alone would hand it back
   by addition. The post-answer receipt stays. You learn what each answer
   earned; you do not learn where you stand.

5. **Withhold precision, never falsify it.** No zeroed bar, no "at least"
   figure. The panel says the reading is unavailable and the audit strip above
   it names the audit.

6. **It gets a family of its own.** 404, 207 and 451 are `poll-reading` because
   they hide the question. 500 hides your score, so the family is `meter`, and a
   gate can carry it beside any of them.

## Consequences

A config that sells a reading is a counter, and is meant to be: 500 darkens the
screen's own gauge, not what Telemetry or the community peek tell you.

`gateStake.projection` is computed when Dry Run is held and rendered by nothing.
500's copy therefore names the band badge beside the reading, which is what a
player actually reads as where they will land. When the projection does get a
renderer it will sit on the meter, so it will go dark with it, and Dry Run stops
being a pure counter on that one axis. That is a decision for the ADR that
builds it.

The debrief and the gate outcome restate the band in full, unchanged. You answer
without the reading; you are told afterwards. That is ADR-092's principle, and
500 is the first audit to apply it to the player's own score rather than to the
poll.
