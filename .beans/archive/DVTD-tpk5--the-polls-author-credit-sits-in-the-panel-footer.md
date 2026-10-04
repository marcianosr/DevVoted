---
# DVTD-tpk5
title: The poll's author credit sits in the panel footer
status: completed
type: task
priority: normal
created_at: 2026-09-15T09:10:45Z
updated_at: 2026-09-15T09:14:26Z
---

The Author credit floats as a bare row under the poll panel, carrying its own rule. The mock puts it in the poll panel's own footer, sharing the row with the controls hint (credit left, hint right).

- [x] Author takes `rule` (default true) so a host that already rules can switch it off
- [x] Author takes `size` so a footer credit is not a 32px avatar next to 12px text
- [x] PollScreen folds author + hint into one Panel.Footer
- [x] Specs and stories cover the footer placement

## Summary of Changes

- `Author.ui.tsx` gained `rule` (default true) and `size` (`md` 32px default, `sm` 20px). The rule/`w-full` chrome now only lands when the host is not already ruling.
- `PollScreen.ui.tsx` drops the standalone Author row under the poll panel. A `PollCredit` region renders one `Panel.Footer`: credit in the children slot, controls hint in the `trailing` slot (right-aligned, rendered `as="span"` so a `<p>` does not sit inside the trailing `<span>`).
- Specs: Author covers rule-off and both sizes; PollScreen asserts credit and hint share the poll panel footer.
- Story: `Kanto/Author · InAPanelFooter` shows the composed footer.

Open question: the mock reads "written by @handle", the kit says "Created by @handle" (also used by ReviewScreen). Copy left unchanged.
