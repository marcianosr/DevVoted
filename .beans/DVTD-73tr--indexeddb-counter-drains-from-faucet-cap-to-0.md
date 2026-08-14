---
# DVTD-73tr
title: 'IndexedDB counter: drains from faucet cap to 0'
status: todo
type: feature
created_at: 2026-08-04T16:37:17Z
updated_at: 2026-08-04T16:37:17Z
parent: DVTD-cb52
---

Show a live countdown on the IndexedDB config during a run: starts at FAUCET_CAP_KB (320KB) and drains to 0 as the faucet pays out; at 0 the config is spent. Pure derived value — remaining = max(0, FAUCET_CAP_KB - faucetEarnedKb), both already in run state (run.model.ts:186, rules.model.ts:13) — so scope is viewmodel + Tier-1 display only. Surface as a compact inline counter on the config chip/pipeline row (no callout). Design detail: how the row reads once empty (muted? 'spent' state?). Note: counter is run-wide by design — the roster has exactly one faucet config; if a second faucet ships the counter splits per config id (rules.model.ts:11).
