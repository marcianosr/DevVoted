---
# DVTD-cknc
title: Consolidate UserAvatar and AvatarWithBorder into a single Avatar component
status: in-progress
type: task
created_at: 2026-06-06T08:33:52Z
updated_at: 2026-06-06T08:33:52Z
---

Unify the two near-identical avatar components into one. New component: src/domains/users/components/Avatar.component.tsx. Takes a user object + size + shape ('circle' | 'square'). Square shape renders border if equippedBorderId present. Kanto-hash color fallback for both shapes. Migrate all callers (GatesMinimap, FallenPlayerModal, PostAnswerCarousel, AvatarPopover, profile route) and delete the two old components.
