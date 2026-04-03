import { InferSelectModel } from "drizzle-orm";

import { runsTable } from "@/src/database/schema";
import { ChallengeModeId } from "~/domains/runs/data/challengeModes";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import type { PipelineSlot } from "~/domains/runs/models/pipeline";
import { STORAGE_UNITS } from "~/lib/storage";

// TODO: Refactor this to ActiveRun?
export type Run = {
	id: number;
	userId: string;
	seasonId: number | null;
	status: "active" | "finished";
	challengeModeId: ChallengeModeId;
	storageLimit: number;
	activeConfigIds: string[];
	rerolls: number;
	totalRerolls: number;
	rerollStorageUsed: number;
	shopSkippedDate: string | null;
	shopInteractedDate: string | null;
	completionReason: string | null;
	victoryAchievedAt: Date | null;
	startedAt: Date;
	finishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCoverage: RunCategoryCoverage[];
	deinstallPenalty: number;
	correctPollsCount: number;
	pipelineSlots: PipelineSlot[];
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
		challengeModeId: (record.challenge_mode_id ?? "vanilla") as ChallengeModeId,
		storageLimit: record.storage_limit,
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
		deinstallPenalty: record.deinstall_penalty,
		correctPollsCount: record.correct_polls_count,
		// pipeline_slots is stored as JSON. We trust our own write path (savePipelineSlots)
		// to guarantee valid PipelineSlot[] — this cast is safe at the DB boundary.
		pipelineSlots: (record.pipeline_slots ?? []) as PipelineSlot[],
	};
};

export const runFromDTO = (dto: Run): RunRecord => {
	return {
		id: dto.id,
		user_id: dto.userId,
		season_id: dto.seasonId,
		status: dto.status,
		challenge_mode_id: dto.challengeModeId,
		storage_limit: dto.storageLimit,
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
		deinstall_penalty: dto.deinstallPenalty || 0,
		correct_polls_count: dto.correctPollsCount || 0,
		pipeline_slots: dto.pipelineSlots,
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

	return {
		id: 0,
		userId: "",
		seasonId: null,
		status: "active",
		challengeModeId: "vanilla",
		storageLimit: STORAGE_UNITS.MB, // 1MB default
		activeConfigIds: [],
		rerolls: 0,
		totalRerolls: 0,
		rerollStorageUsed: 0,
		shopSkippedDate: null,
		shopInteractedDate: null,
		completionReason: null,
		victoryAchievedAt: null,
		startedAt: now,
		finishedAt: null,
		createdAt: now,
		updatedAt: now,
		categoryCoverage: [],
		deinstallPenalty: 0,
		correctPollsCount: 0,
		pipelineSlots: [],
		...partial,
	};
};

// Test factory functions
export const createMockRun = (overrides: Partial<Run> = {}): Run => {
	const { pipelineSlots = [], ...rest } = overrides;
	return {
		id: 1,
		userId: "test-user-id",
		seasonId: 1,
		status: "active",
		challengeModeId: "vanilla",
		storageLimit: STORAGE_UNITS.MB,
		activeConfigIds: [],
		rerolls: 0,
		totalRerolls: 0,
		rerollStorageUsed: 0,
		shopSkippedDate: null,
		shopInteractedDate: null,
		completionReason: null,
		victoryAchievedAt: null,
		startedAt: new Date("2024-01-01T00:00:00Z"),
		finishedAt: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		categoryCoverage: [],
		deinstallPenalty: 0,
		correctPollsCount: 0,
		pipelineSlots,
		...rest,
	};
};

export const createMockRunRecord = (
	overrides: Partial<RunRecord> = {}
): RunRecord => {
	return {
		completion_reason: null,
		victory_achieved_at: null,
		id: 1,
		user_id: "test-user-id",
		season_id: 1,
		status: "active",
		challenge_mode_id: "vanilla",
		storage_limit: STORAGE_UNITS.MB,
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
		...overrides,
	};
};

export const createMockRunArray = (count: number = 3): Run[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRun({
			id: i + 1,
		})
	);
};

export const createMockRunRecordArray = (count: number = 3): RunRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRunRecord({
			id: i + 1,
		})
	);
};

export const runFactory = {
	toDTO: runToDTO,
	fromDTO: runFromDTO,
	toDTOs: runsToDTOs,
	fromDTOs: runsFromDTOs,
	create: createRun,
};
