import { runsTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";
import { STORAGE_UNITS } from "~/lib/storage";

export type Run = {
	id: number;
	userId: string;
	status: "active" | "finished";
	storageLimit: number;
	activeConfigIds: string[];
	startedAt: Date;
	finishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type RunRecord = InferSelectModel<typeof runsTable>;

export const runToDTO = (record: RunRecord): Run => {
	return {
		id: record.id,
		userId: record.user_id,
		status: record.status,
		storageLimit: record.storage_limit,
		activeConfigIds: record.active_config_ids || [],
		startedAt: record.started_at || new Date(),
		finishedAt: record.finished_at,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const runFromDTO = (dto: Run): RunRecord => {
	return {
		id: dto.id,
		user_id: dto.userId,
		status: dto.status,
		storage_limit: dto.storageLimit,
		active_config_ids: dto.activeConfigIds,
		started_at: dto.startedAt,
		finished_at: dto.finishedAt,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const runsToDTOs = (records: RunRecord[]): Run[] => {
	return records.map(runToDTO);
};

export const runsFromDTOs = (dtos: Run[]): RunRecord[] => {
	return dtos.map(runFromDTO);
};

export const createRun = (partial: Partial<Run> = {}): Run => {
	const now = new Date();
	
	return {
		id: 0,
		userId: "",
		status: "active",
		storageLimit: STORAGE_UNITS.MB, // 1MB default
		activeConfigIds: [],
		startedAt: now,
		finishedAt: null,
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

// Test factory functions
export const createMockRun = (overrides: Partial<Run> = {}): Run => {
	return {
		id: 1,
		userId: "test-user-id",
		status: "active",
		storageLimit: STORAGE_UNITS.MB,
		activeConfigIds: [],
		startedAt: new Date("2024-01-01T00:00:00Z"),
		finishedAt: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockRunRecord = (overrides: Partial<RunRecord> = {}): RunRecord => {
	return {
		id: 1,
		user_id: "test-user-id",
		status: "active",
		storage_limit: STORAGE_UNITS.MB,
		active_config_ids: [],
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