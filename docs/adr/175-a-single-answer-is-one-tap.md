# ADR-175: A single answer is one tap

## Status

Accepted — 2026-10-02 (Marciano, DVTD-o34i). Amends
[ADR-170](170-an-answer-lands-and-the-next-poll-follows.md)'s answer feedback with a row-level
verdict, and moves the poll number off the press that
[ADR-117](117-the-primary-press-is-one-wide-bar.md) put it on.

## Context

A single-answer poll took two presses: pick an option, then **Lock in 1
answer**. The second press added nothing the first had not already said. Its
note, "you can also press Enter to answer", was a keyboard tip, which is noise
on a phone. Players also reported not seeing the answer feedback. A headless
probe showed the shake, the gain chip and the accuracy pulse all fire, but
they are short (650 ms) and none of them sits on the option the player was
looking at.

## Decision 1: a single answer is sent on the tap

Tapping an option or pressing its letter sends a single-answer poll at once.
`PollView` owns the rule: parents hand it one `onAnswer(optionIds)` and it
routes a single pick there, while a multi pick still goes to `onSelect`.
`RunPoll`'s existing busy/reveal guard keeps a double tap from sending twice.

A misclick now costs the answer. That trade is accepted: a single answer is one
choice, and a keyboard player already committed with one letter and Enter.

## Decision 2: a multi answer keeps Lock in

Only the player knows when a set of picks is complete, so a multi-answer poll
keeps **Lock in** (or Enter). Counting picks against the number of correct
answers would give that number away.

## Decision 3: the poll number moves to the card's top line

The count swatch rode on the Lock in press. With no press on a single poll it
leads the card's meta row instead, the same place on every poll type.

## Decision 4: the keyboard tip shows for a fine pointer only

`press a letter to answer` or `press letters, then Enter` sits at the right end
of the meta row behind `pointer-fine:`. The tip is about the input device, not
the screen width, so a pointer query states the reason better than a
breakpoint does.

## Decision 5: the answered row flashes its verdict

An answered option rings and glows once in its verdict hue (`answer-verdict`)
and its ✓ or ✗ pops in (`reveal-pop`), on top of the card shake and the gain
chip. Reduced motion drops both.

## Consequences

`PollCommit` is `{ lock?, skip? }`. A screen with no lock-in press draws none.
The approval press (LGTM) rides `lock` too.
