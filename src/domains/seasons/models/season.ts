import { seasonsTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

export type Season = {
	id: number;
	name: string;
	description: string | null;
	status: "upcoming" | "active" | "finished" | "archived";
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	updatedAt: Date | null;
};

export type SeasonRecord = InferSelectModel<typeof seasonsTable>;

export const seasonToDTO = (record: SeasonRecord): Season => {
	return {
		id: record.id,
		name: record.name,
		description: record.description,
		status: record.status,
		startDate: record.start_date,
		endDate: record.end_date,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const seasonFromDTO = (dto: Season): SeasonRecord => {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		status: dto.status,
		start_date: dto.startDate,
		end_date: dto.endDate,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const seasonsToDTOs = (records: SeasonRecord[]): Season[] => {
	return records.map(seasonToDTO);
};

export const seasonsFromDTOs = (dtos: Season[]): SeasonRecord[] => {
	return dtos.map(seasonFromDTO);
};

export const createSeason = (partial: Partial<Season> = {}): Season => {
	const now = new Date();
	
	return {
		id: 0,
		name: "",
		description: null,
		status: "upcoming",
		startDate: now,
		endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days default
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

// Test factory functions
export const createMockSeason = (overrides: Partial<Season> = {}): Season => {
	return {
		id: 1,
		name: "Season 1: Core Loop",
		description: "The inaugural season focusing on core gameplay mechanics",
		status: "active",
		startDate: new Date("2024-12-13T00:00:00Z"), // Christmas themed dates per CLAUDE.md
		endDate: new Date("2024-12-25T23:59:59Z"),
		createdAt: new Date("2024-12-01T00:00:00Z"),
		updatedAt: new Date("2024-12-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockSeasonRecord = (overrides: Partial<SeasonRecord> = {}): SeasonRecord => {
	return {
		id: 1,
		name: "Season 1: Core Loop",
		description: "The inaugural season focusing on core gameplay mechanics",
		status: "active",
		start_date: new Date("2024-12-13T00:00:00Z"),
		end_date: new Date("2024-12-25T23:59:59Z"),
		created_at: new Date("2024-12-01T00:00:00Z"),
		updated_at: new Date("2024-12-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockSeasonArray = (count: number = 3): Season[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockSeason({
			id: i + 1,
			name: `Season ${i + 1}: Core Loop`,
		})
	);
};

export const createMockSeasonRecordArray = (count: number = 3): SeasonRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockSeasonRecord({
			id: i + 1,
			name: `Season ${i + 1}: Core Loop`,
		})
	);
};

export const seasonFactory = {
	toDTO: seasonToDTO,
	fromDTO: seasonFromDTO,
	toDTOs: seasonsToDTOs,
	fromDTOs: seasonsFromDTOs,
	create: createSeason,
};