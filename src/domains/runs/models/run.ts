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

export const runFactory = {
	toDTO: runToDTO,
	fromDTO: runFromDTO,
	toDTOs: runsToDTOs,
	fromDTOs: runsFromDTOs,
	create: createRun,
};