import { runsTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

export type Run = {
	id: number;
	userId: string;
	status: "active" | "finished";
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