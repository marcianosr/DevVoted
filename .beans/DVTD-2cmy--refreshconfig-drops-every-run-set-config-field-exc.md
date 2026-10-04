---
# DVTD-2cmy
title: A config's run-set changes are wiped on the next action
status: todo
type: bug
priority: normal
created_at: 2026-09-15T14:04:12Z
updated_at: 2026-09-24T12:49:26Z
parent: DVTD-72d9
---

**What:** Changes made to a config during a run survive the next action.

**Why:** Everything but its version is rebuilt from the roster each time, so a fading config almost certainly never fades.

## Done when
- [ ] A decayed config still holds its decay after the next action
- [ ] The other fields set during a run survive too
- [ ] A spec per field: minified, arm, coverage multiplier

## Notes

`refreshConfig` in src/modules/run/run/domain/runSnapshot.model.ts:39 rebuilds each build config from the roster on every hydration and preserves only `level`:

    const refreshConfig = (config: Config): Config => {
        const current = CONFIG_LIST.find((c) => c.id === config.id);
        if (!current) return config;
        if (config.level === undefined) return current;
        return { ...current, level: config.level };
    };

Every other per-run mutation on a build config instance is therefore reset on the next action, because applyActionToRun hydrates from the DB each time.

Fields at risk: `minified` (minify), `abArm` plus its spread arm payload (switchArm), and `coverageMultiplier` as mutated by decay (`fade`).

Reachability: `minify` and `switch-arm` have no live UI dispatch, so only **Deprecated's decay is reachable in the live game** — a Deprecated config should fade x3 -> x2.5 -> ... and be deleted at x1, but the roster's x3 is likely restored on each hydration.

NOT VERIFIED END TO END. Found while tracing hydration for DVTD-5cut (vendor-lock-in); that feature sidesteps it by storing its lock on `Build` rather than on the Config instance, which is why it is not blocked on this.

## Todos

- Reproduce: hydrate a snapshot holding a decayed Deprecated and assert the multiplier survives
- Decide the fix: an allowlist of run-set fields, or invert to merge roster copy over the run instance
- Check whether anything relies on the roster refresh resetting a field
- Spec per field: minified, abArm, coverageMultiplier
