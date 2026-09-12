---
# DVTD-d16l
title: 'Wiki drift: sections 2, 3 and 5 describe the retired model'
status: todo
type: task
priority: normal
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-12T12:58:47Z
---

`docs/wiki.md` states the current rules, and after ADR-071, ADR-073 and ADR-074
several of its sections state rules that are decided against but not yet built.
The wiki describes what runs, so it should be rewritten when the code lands, not
before, and this bean holds the list until then.

## What goes stale, and with which bean

- **2.2 Gates** and **2.6 Missing a gate**: a gate has four outcomes, only
  HEALTHY advances, nothing peels on a miss, DANGER ends the run. Lands with
  DVTD-7uil.
- **2.5 Coverage (scoring)**: the gain is flat, coverage resets each gate and
  caps at 100%, the HEALTHY line is the difficulty. §2.7's baseline paragraph
  and §2.8's demand table both carry the old numbers.
- **3 Your Build** and **5.2 The Shop**: no slot ladder, no ceiling, weight
  bills KB every gate.
- **5.1 Storage (KB)**: no cap, and the plan sells free weight instead.
- **10 Numbers reference**: most of it.

## Todo

- [ ] Rewrite each section as its implementing bean lands, not in one pass
- [ ] Check the glossary: "slot", "capacity" and "spot" all change meaning or go
- [ ] Re-sync the Notion snapshot afterwards
