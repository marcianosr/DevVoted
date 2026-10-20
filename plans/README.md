# Animation plans

Written by `improve-animations`. Each plan is self-contained and safe to hand to any agent.

| #   | Plan                                                         | Severity | Status |
| --- | ------------------------------------------------------------ | -------- | ------ |
| 001 | [Flat Button press feedback](001-flat-button-press-feedback.md) | MEDIUM   | DONE   |
| 002 | [Modal entrance](002-modal-entrance.md)                      | MEDIUM   | DONE   |
| 003 | [Nav menu grows from trigger](003-nav-menu-grows-from-trigger.md) | LOW      | DONE   |
| 004 | [Fold body opens smoothly](004-fold-body-opens-smoothly.md)  | LOW      | DONE   |

## Execution order

001 → 002 → 003 → 004.

## Dependencies

- All four use the `--ease-out-strong` token in the `@theme` block of
  `src/ui/kanto-theme/kanto.css`. Whichever plan runs first adds it; the others
  skip that step.
- 001 removes `transition-colors` from the Button base. Run its raised-tone feel
  check before merging anything else, because it may change how `press-sunk` feels.
- 003 and 004 both rely on `<details>` behaviour. Do them in separate commits so a
  cross-browser issue in one doesn't block the other.
