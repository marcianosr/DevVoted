---
# DVTD-6crx
title: Delete src/ui/old-theme wholesale
status: todo
type: task
created_at: 2026-09-07T14:36:53Z
updated_at: 2026-09-07T14:36:53Z
blocked_by:
    - DVTD-tduu
---

The quarantined legacy kit (91 files renamed from src/ui root, 2026-09-07). Blockers, per the dependency sweep: __root global chrome (PageLayoutUI/Dropdown/ConfirmDialog/Footer/NotFound/CatchBoundary), login+sign-up (Button/typography), all /run/* routes (Screen.ui + module screens - DVTD-tduu), /polls (ErrorComponent), /profile (BorderShop->Button), /stats, /presentation (GameLoopExplainer/rarityColors), /dex (Stack/typography via ConfigdexPanel), typography/ with 40+ importers. sizes.ts already moved to terminal-theme; DataTable/Tabs/useCountUp already deleted. Precedent: skin/ died in one pure-deletion commit only after external importers hit zero (51b6237) - migrate first, delete last.
