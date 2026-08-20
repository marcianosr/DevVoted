---
# DVTD-5w9g
title: 'Config: Moment.js → date-fns (EOL lineage)'
status: todo
type: task
tags:
    - config
created_at: 2026-08-19T20:36:10Z
updated_at: 2026-08-19T20:36:10Z
parent: DVTD-72d9
---

Self-destruct lineage config (Balatro Gros Michel → Cavendish; brainstorm
2026-08-19).

Moment.js (uncommon): +64KB on gate clear (double Unit Tests), but each clear
rolls 1-in-6 that it hits EOL and uninstalls itself mid-run. The FIRST time it
EOLs on an account, date-fns (rare) permanently joins that account's draft
pool: same +64KB, no EOL roll. The death mints content — players end up
wanting the EOL to happen once.

- Vocabulary: the death is "EOL", never "deprecated" (that word belongs to the audit).
- Roll derived from run seed + gate index like OfflinePick (reload-safe, no Math.random).
- Deliberately reuses the storage-on-clear axis; the new axes are the gamble + the account unlock.
- Unlock half depends on DVTD-2try (config unlock system); the EOL gamble works standalone before that lands.
- Related: DVTD-x8py (RNG), DVTD-5ljh (rarity weighting for the rare pool entry).
