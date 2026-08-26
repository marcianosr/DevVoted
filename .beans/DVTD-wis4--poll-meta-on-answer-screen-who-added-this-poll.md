---
# DVTD-wis4
title: 'Poll meta on answer screen: who added this poll'
status: completed
type: feature
priority: normal
created_at: 2026-08-04T16:35:15Z
updated_at: 2026-08-25T20:41:32Z
parent: DVTD-cb52
---

The answer screen shows only category, question, and options. Add attribution meta: who added this poll (author name, e.g. 'added by X'). Data already exists — polls.created_by references users (schema.ts:128, onDelete set-null preserves history) — so scope is: include author in the poll DTO/query, then surface it in the Tier-1 answer screen UI. Handle the deleted-author (null) case.
