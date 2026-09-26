---
# DVTD-jscc
title: The Dex and the shop say services, in two panels
status: completed
type: feature
priority: normal
created_at: 2026-09-25T11:00:14Z
updated_at: 2026-09-25T18:06:13Z
parent: DVTD-r2k9
---

**What:** The Dex tab and the shop panel call the registry's non-config purchases services, and the Dex shows them as registry services and run services with a footer each.

**Why:** "Control" named a button, and one panel hid that the git tag is a different kind of purchase from a rebuild.

## Done when

- [x] The Dex tab reads services
- [x] The Dex shows registry services and run services as two panels, each with its own count and footer
- [x] A panel with nothing in it does not render
- [x] A withheld row reads Unmet service
- [x] The shop's panel of presses reads Services
- [x] Nothing about buying, pricing or staging changes

## Notes

- ADR-115 D8: copy only. Code keeps `RegistryControl*`, `controldex`, `shopControls`, `registryControl.model.ts` and the tab id `"controls"`, because ADR-002 reserves `.service.ts` for application orchestration.
- The roster gains `scope: "registry" | "run"`; the Dex viewmodel groups on it and emits every scope; the UI renders each non-empty panel (ADR-115 D9).
- The run-services footer is truthful today: the git tag is still bought in the shop with run storage. The archive purchase is DVTD-0now.
- The shop's panel header says Services, not Registry services, because that panel still holds the git tag's placement press, which the Dex files under run services.
- Built on top of DVTD-8zb3's staged, uncommitted controls tab.

## Summary of Changes

The Dex tab is labelled **services** (its id stays `controls`) and renders two panels from one roster: **registry services** (Rebuild, Extend) and **run services** (the git tag), each with its own count, meta and footer, and a panel with no rows is not rendered. The roster (`registryControl.model.ts`) gained `scope: "registry" | "run"` and `REGISTRY_CONTROL_SCOPES`; `controldex` carries the scope on met and unmet rows; `dexControlsFor` groups by scope and owns the two footers; `DexControls.ui` takes `panels`. Copy-only rename elsewhere: the shop panel header reads **Services** and a withheld row reads **Unmet service**. The run-services footer states what is true today (the tag is still bought in the shop with run storage); the archive purchase is DVTD-0now.

Docs: ADR-115 written, ADR-110 deleted with a Retired row, ADR-112 D1 collapsed, ADR-029 and ADR-036 pointed, rejected.md carries the licence-era reasoning; wiki §2.8, §6.1, §6.4, glossary and numbers table; CONTEXT.md rows and renames table; the unreleased changelog bullet rewritten in place.

Verified: 3748 tests pass (198 files), `tsc --noEmit` clean, oxlint 4 pre-existing warnings (none in this change), dependency-cruiser clean over 723 modules, wiki in sync after `docs:sync`, prettier clean on every touched file. `beans check` reports 8 pre-existing broken links, none in this pass.

2026-09-25 (DVTD-k59a): the redacted label became **Locked service** (mirroring "Locked config") when services became unlockables (ADR-116).

2026-09-25, later (DVTD-lm8p, ADR-115 D10): the two panels became one section listing every service; `REGISTRY_CONTROL_SCOPES` was deleted.
