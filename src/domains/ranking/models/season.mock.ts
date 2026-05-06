import type { Season, SeasonRecord } from "./season.model";

export const createMockSeason = (overrides: Partial<Season> = {}): Season => ({
	id: 1,
	name: "Season 1: Core Loop",
	description: "The inaugural season focusing on core gameplay mechanics",
	status: "active",
	startDate: new Date("2024-12-13T12:00:00Z"),
	endDate: new Date("2024-12-25T12:00:00Z"),
	createdAt: new Date("2024-12-01T12:00:00Z"),
	updatedAt: new Date("2024-12-01T12:00:00Z"),
	...overrides,
});

export const createMockSeasonRecord = (
	overrides: Partial<SeasonRecord> = {}
): SeasonRecord => ({
	id: 1,
	name: "Season 1: Core Loop",
	description: "The inaugural season focusing on core gameplay mechanics",
	status: "active",
	start_date: new Date("2024-12-13T12:00:00Z"),
	end_date: new Date("2024-12-25T12:00:00Z"),
	created_at: new Date("2024-12-01T12:00:00Z"),
	updated_at: new Date("2024-12-01T00:00:00Z"),
	...overrides,
});

export const createMockSeasonArray = (count: number = 3): Season[] =>
	Array.from({ length: count }, (_, i) =>
		createMockSeason({ id: i + 1, name: `Season ${i + 1}: Core Loop` })
	);

export const createMockSeasonRecordArray = (
	count: number = 3
): SeasonRecord[] =>
	Array.from({ length: count }, (_, i) =>
		createMockSeasonRecord({ id: i + 1, name: `Season ${i + 1}: Core Loop` })
	);
