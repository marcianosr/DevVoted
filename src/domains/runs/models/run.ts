import { runsTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";
import { STORAGE_UNITS } from "~/lib/storage";
import type { RunCategoryCoverage } from "./runCategoryCoverage";

// TODO: Refactor this to ActiveRun?
export type Run = {
	id: number;
	userId: string;
	seasonId: number | null;
	status: "active" | "finished";
	storageLimit: number;
	activeConfigIds: string[];
	rerolls: number;
	totalRerolls: number;
	rerollStorageUsed: number;
	startedAt: Date;
	finishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCoverage: RunCategoryCoverage[];
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
		storageLimit: record.storage_limit,
		activeConfigIds: record.active_config_ids || [],
		rerolls: record.rerolls,
		totalRerolls: record.total_rerolls,
		rerollStorageUsed: record.reroll_storage_used,
		startedAt: record.started_at || new Date(),
		finishedAt: record.finished_at,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
		categoryCoverage,
	};
};

export const runFromDTO = (dto: Run): RunRecord => {
	return {
		id: dto.id,
		user_id: dto.userId,
		season_id: dto.seasonId,
		status: dto.status,
		storage_limit: dto.storageLimit,
		active_config_ids: dto.activeConfigIds,
		rerolls: dto.rerolls,
		total_rerolls: dto.totalRerolls,
		reroll_storage_used: dto.rerollStorageUsed,
		started_at: dto.startedAt,
		finished_at: dto.finishedAt,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
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
		storageLimit: STORAGE_UNITS.MB, // 1MB default
		activeConfigIds: [],
		rerolls: 0,
		totalRerolls: 0,
		rerollStorageUsed: 0,
		startedAt: now,
		finishedAt: null,
		createdAt: now,
		updatedAt: now,
		categoryCoverage: [],
		...partial,
	};
};

// Test factory functions
export const createMockRun = (overrides: Partial<Run> = {}): Run => {
	return {
		id: 1,
		userId: "test-user-id",
		seasonId: 1,
		status: "active",
		storageLimit: STORAGE_UNITS.MB,
		activeConfigIds: [],
		rerolls: 0,
		totalRerolls: 0,
		rerollStorageUsed: 0,
		startedAt: new Date("2024-01-01T00:00:00Z"),
		finishedAt: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		categoryCoverage: [],
		...overrides,
	};
};

export const createMockRunRecord = (
	overrides: Partial<RunRecord> = {}
): RunRecord => {
	return {
		id: 1,
		user_id: "test-user-id",
		season_id: 1,
		status: "active",
		storage_limit: STORAGE_UNITS.MB,
		active_config_ids: [],
		rerolls: 0,
		total_rerolls: 0,
		reroll_storage_used: 0,
		started_at: new Date("2024-01-01T00:00:00Z"),
		finished_at: null,
		created_at: new Date("2024-01-01T00:00:00Z"),
		updated_at: new Date("2024-01-01T00:00:00Z"),
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
