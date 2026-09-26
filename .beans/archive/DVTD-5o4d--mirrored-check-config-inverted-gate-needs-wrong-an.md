---
# DVTD-5o4d
title: 'Mirrored check-config (inverted: gate needs WRONG answers)'
status: scrapped
type: feature
priority: deferred
created_at: 2026-07-12T08:45:32Z
updated_at: 2026-08-17T09:52:08Z
parent: DVTD-615s
---

Parked from the rebuild (ADR-006 §4). A check-config that inverts a gate condition: the window must contain N WRONG answers, paying 2x storage. The brain-bender — pairing it with the Correct baseline forces deliberate mixing of right and wrong over 5 shared polls. Engine support existed in the prototype (windowWrong lens). Bring back after the core rebuild lands: re-add 'mirrored' to CheckKind, the CONFIGS roster entry, gate checkStatuses/gateDemands branch, and windowWrong helper. UI needs a clear 'you WANT to be wrong here' cue.

## Reasons for Scrapping

Shipped as the Marsh gate audit instead of a config (ADR-035, DVTD-gre4). The 'you WANT to be wrong' UI cue requirement carries over.
