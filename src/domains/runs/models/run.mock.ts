import { STORAGE_UNITS } from "~/lib/storage";

import type { Run, RunRecord } from "./run.model";

export const createMockRun = (overrides: Partial<Run> = {}): Run => {
	const {
		pipelineSlots = [],
		pipelineSlotSnapshots = [],
		pendingUpgradeCards = [],
		...rest
	} = overrides;
	return {
		id: 1,
		userId: "test-user-id",
		seasonId: 1,
		status: "active",
		mode: "calendar",
		storageLimit: STORAGE_UNITS.MB,
		injectedArchiveBytes: 0,
		activeConfigIds: [],
		rerolls: 0,
		totalRerolls: 0,
		rerollStorageUsed: 0,
		shopSkippedDate: null,
		shopInteractedDate: null,
		completionReason: null,
		victoryAchievedAt: null,
		lootedByUserId: null,
		lootedAt: null,
		lootAmount: null,
		startedAt: new Date("2024-01-01T00:00:00Z"),
		finishedAt: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		categoryCoverage: [],
		deinstallPenalty: 0,
		correctPollsCount: 0,
		pipelineSlots,
		pipelineSlotSnapshots,
		pendingUpgradeCards,
		...rest,
	};
};

export const createMockRunRecord = (
	overrides: Partial<RunRecord> = {}
): RunRecord => ({
	completion_reason: null,
	victory_achieved_at: null,
	looted_by_user_id: null,
	looted_at: null,
	loot_amount: null,
	id: 1,
	user_id: "test-user-id",
	season_id: 1,
	status: "active",
	mode: "calendar",
	storage_limit: STORAGE_UNITS.MB,
	injected_archive_bytes: 0,
	active_config_ids: [],
	rerolls: 0,
	total_rerolls: 0,
	reroll_storage_used: 0,
	shop_skipped_date: null,
	shop_interacted_date: null,
	started_at: new Date("2024-01-01T00:00:00Z"),
	finished_at: null,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
	deinstall_penalty: 0,
	correct_polls_count: 0,
	pipeline_slots: [],
	pipeline_slot_snapshots: [],
	pending_upgrade_cards: [],
	...overrides,
});

export const createMockRunArray = (count: number = 3): Run[] =>
	Array.from({ length: count }, (_, i) => createMockRun({ id: i + 1 }));

export const createMockRunRecordArray = (count: number = 3): RunRecord[] =>
	Array.from({ length: count }, (_, i) => createMockRunRecord({ id: i + 1 }));
