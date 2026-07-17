import type { InferSelectModel } from "drizzle-orm";

import type { runsTable } from "@/src/database/schema";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import { STORAGE_UNITS } from "~/lib/storage";

// TODO: Refactor this to ActiveRun?
export type Run = {
	id: number;
	userId: string;
	seasonId: number | null;
	status: "active" | "finished";
	/** Run cadence: "calendar" (one poll/day) or "session" (opt-in climb). Inert until session runs ship. */
	mode: "calendar" | "session";
	storageLimit: number;
	injectedArchiveBytes: number;
	activeConfigIds: string[];
	rerolls: number;
	totalRerolls: number;
	rerollStorageUsed: number;
	shopSkippedDate: string | null;
	shopInteractedDate: string | null;
	completionReason: string | null;
	victoryAchievedAt: Date | null;
	lootedByUserId: string | null;
	lootedAt: Date | null;
	lootAmount: number | null;
	startedAt: Date;
	finishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCoverage: RunCategoryCoverage[];
	deinstallPenalty: number;
	correctPollsCount: number;
	pipelineSlots: PipelineSlot[];
	pipelineSlotSnapshots: PipelineSlot[][];
	pendingUpgradeCards: UpgradeCard[];
};

export type RunRecord = InferSelectModel<typeof runsTable>;

export const runToDTO = (
	record: RunRecord,
	categoryCoverage: RunCategoryCoverage[] = []
): Run => {
	return {
		id: record.id,
		userId: record.user_id,
		seasonId: record.season_id,
		status: record.status,
		mode: record.mode,
		storageLimit: record.storage_limit,
		injectedArchiveBytes: record.injected_archive_bytes,
		activeConfigIds: record.active_config_ids || [],
		rerolls: record.rerolls,
		totalRerolls: record.total_rerolls,
		rerollStorageUsed: record.reroll_storage_used,
		shopSkippedDate: record.shop_skipped_date,
		shopInteractedDate: record.shop_interacted_date,
		startedAt: record.started_at || new Date(),
		finishedAt: record.finished_at,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
		categoryCoverage,
		completionReason: record.completion_reason,
		victoryAchievedAt: record.victory_achieved_at,
		lootedByUserId: record.looted_by_user_id,
		lootedAt: record.looted_at,
		lootAmount: record.loot_amount,
		deinstallPenalty: record.deinstall_penalty,
		correctPollsCount: record.correct_polls_count,
		// pipeline_slots is stored as JSON. We trust our own write path (savePipelineSlots)
		// to guarantee valid PipelineSlot[] — this cast is safe at the DB boundary.
		pipelineSlots: (record.pipeline_slots ?? []) as PipelineSlot[],
		// Snapshot of slots active at the end of each gate (index 0 = gate 1, etc.).
		// No default in schema — normalise to [].
		pipelineSlotSnapshots: (record.pipeline_slot_snapshots ??
			[]) as PipelineSlot[][],
		// pending_upgrade_cards is empty when no upgrade is awaiting a decision.
		// The schema column has no default, so Drizzle may return undefined — normalise to [].
		pendingUpgradeCards: (record.pending_upgrade_cards ?? []) as UpgradeCard[],
	};
};

export const runFromDTO = (dto: Run): RunRecord => {
	return {
		id: dto.id,
		user_id: dto.userId,
		season_id: dto.seasonId,
		status: dto.status,
		mode: dto.mode,
		storage_limit: dto.storageLimit,
		injected_archive_bytes: dto.injectedArchiveBytes,
		active_config_ids: dto.activeConfigIds,
		rerolls: dto.rerolls,
		total_rerolls: dto.totalRerolls,
		reroll_storage_used: dto.rerollStorageUsed,
		shop_skipped_date: dto.shopSkippedDate,
		shop_interacted_date: dto.shopInteractedDate,
		started_at: dto.startedAt,
		finished_at: dto.finishedAt,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
		completion_reason: dto.completionReason || null,
		victory_achieved_at: dto.victoryAchievedAt || null,
		looted_by_user_id: dto.lootedByUserId || null,
		looted_at: dto.lootedAt || null,
		loot_amount: dto.lootAmount ?? null,
		deinstall_penalty: dto.deinstallPenalty || 0,
		correct_polls_count: dto.correctPollsCount || 0,
		pipeline_slots: dto.pipelineSlots,
		pipeline_slot_snapshots: dto.pipelineSlotSnapshots,
		pending_upgrade_cards: dto.pendingUpgradeCards,
	};
};

export const runsToDTOs = (records: RunRecord[]): Run[] => {
	return records.map((record) => runToDTO(record));
};

export const runsFromDTOs = (dtos: Run[]): RunRecord[] => {
	return dtos.map(runFromDTO);
};

export const createRun = (partial: Partial<Run> = {}): Run => {
	const now = new Date();
	const {
		pendingUpgradeCards = [],
		pipelineSlotSnapshots = [],
		...rest
	} = partial;

	return {
		id: 0,
		userId: "",
		seasonId: null,
		status: "active",
		mode: "calendar",

		storageLimit: STORAGE_UNITS.MB, // 1MB default
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
		startedAt: now,
		finishedAt: null,
		createdAt: now,
		updatedAt: now,
		categoryCoverage: [],
		deinstallPenalty: 0,
		correctPollsCount: 0,
		pipelineSlots: [],
		pipelineSlotSnapshots,
		pendingUpgradeCards,
		...rest,
	};
};

export const runFactory = {
	toDTO: runToDTO,
	fromDTO: runFromDTO,
	toDTOs: runsToDTOs,
	fromDTOs: runsFromDTOs,
	create: createRun,
};
