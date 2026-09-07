---
# DVTD-4awc
title: proto-run community step onto terminal CommunityScreen, then delete modern community UI
status: todo
type: task
created_at: 2026-09-07T14:36:53Z
updated_at: 2026-09-07T14:36:53Z
---

proto-run.tsx's rewardStep=community branch (~20 JSX lines at ~L636-652 + ~110 fixture lines in simulateCommunityBoard) still mounts modern StandoutsPanel + RunCommunityBoard inside old-theme Screen/Stack. Point it at terminal CommunityScreen (fixtures map onto CommunityScreenProps; see CommunityView.component helpers), then delete src/modules/run/community/presentation/{Standouts,RunCommunity}.{ui,spec,stories}.tsx and Voter.{ui,spec}.tsx - proto-run is their last consumer. Standouts' six-award fixtures in proto-run also still fabricate the RETIRED nine-award shapes; rebuild them on the ADR-065 six.
