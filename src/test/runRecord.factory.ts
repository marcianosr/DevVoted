import type { InferSelectModel } from "drizzle-orm";

import type { runsTable } from "~/database/schema";
import { STORAGE_UNITS } from "~/shared/lib/storage";

type RunRecord = InferSelectModel<typeof runsTable>;

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
	seed_date: null,
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
