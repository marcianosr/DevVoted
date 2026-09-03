---
# DVTD-owun
title: 'Extra spots: buy a step outright'
status: scrapped
type: feature
priority: low
created_at: 2026-08-28T14:42:55Z
updated_at: 2026-08-30T08:40:35Z
---

Parked. A buy-out on an extra-spot step at ten gates of its rent was built in DVTD-lxla and pulled the same day — see ADR-045 Decision 4 and the git history for the shape it had. Its argument: it also buys immunity from the rent default, which is the half of the price KB cannot express. Reconsider once renting has been playtested and the rent rate is settled.

Revisited 2026-08-29 as DVTD-ib77: same purchase, moved out of the rent section and rolled into the deal beside the configs, plus a start-screen variant. That framing answers the one-choice objection this bean was parked on; the extra state does not go away.

## Reasons for Scrapping

Superseded by DVTD-811d / ADR-046. The extra-slot rent ladder this bean argued about
no longer exists: slots are bought outright on a rising price ladder, which is what
both this bean and DVTD-ib77 were reaching for. The ceiling question it turned on
("inside the ladder or on top of it") is moot — there is one ladder now.
