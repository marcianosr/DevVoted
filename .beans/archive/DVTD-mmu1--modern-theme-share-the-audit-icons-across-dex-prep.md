---
# DVTD-mmu1
title: 'Modern-theme: share the audit icons across Dex, prep and poll'
status: completed
type: task
priority: normal
created_at: 2026-08-23T18:34:49Z
updated_at: 2026-08-31T10:24:08Z
---

The audit glyph mapping lives as fixture data in AuditsPanel.stories. Prep shows a generic warn disc and the poll header a bare string; both should carry the audit's own icon.

- [x] audits.ts: AuditId + AUDIT record (label + glyph), one owner
- [x] AuditsPanel reads from it
- [x] PrepScreen audit rows: the audit's glyph instead of Entry mark=warn
- [x] GateHeader: audits prop composing the line from ids, so count cannot disagree with the list
- [x] Verify: tsc, stories typecheck, lint, tests, CSS build

## Summary of Changes

All four code items were already in the tree; this bean was left in-progress after the work landed. Verified 2026-08-31.

- `src/ui/modern-theme/audits.ts` is the single owner: `AuditId` union, `AUDIT` record pairing label + glyph under `as const satisfies Record<AuditId, { label: string; glyph: GlyphName }>`, `AUDIT_ORDER`, and `toAuditId` collapsing the model's per-gate `timeout-N` / `strip-N` suffixes. Returns null rather than a fallback, so a missing icon is missing instead of wrong.
- `screens/AuditsPanel.ui.tsx` reads `AUDIT` / `AuditId` from it.
- `screens/PrepScreen.ui.tsx` renders the extracted `Audits.ui.tsx` fold, which draws each audit's own glyph. The generic `Entry mark="warn"` disc is gone.
- `GateHeader.ui.tsx` takes `audits?: readonly AuditId[]` and derives the count from the list, so the count and the list cannot disagree.
- `AuditsView.component.tsx`, `PrepView.component.tsx` and `PollView.component.tsx` all narrow model ids through `toAuditId`.

Verification: `npm run lint` clean (786 modules, 3219 dependencies, 0 violations). `npm run build` + `tsc --noEmit` clean. `npm test` 2616 passed / 6 skipped / 2 todo. Stories typechecked via a scratchpad tsconfig that clears the `**/*.stories.tsx` exclusion: 24 errors repo-wide, none in this bean's files.

Out of scope, flagged separately: 3 failing tests in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` (text split across elements, pre-existing at HEAD), and the 24 story type errors in ConfiguringScreen, RunCommunity, GateRewardReport, StripScreen, PrepScreen, RunHud, GatesPanel and Screen stories.
