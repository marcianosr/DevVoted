import { db } from "@/src/database/db";
import { seasonsTable } from "@/src/database/schema";
import { eq, and, lte, gte, desc, asc } from "drizzle-orm";
import type { Season, SeasonRecord } from "../models/season";
import { seasonToDTO, seasonsToDTOs } from "../models/season";

export const findAllSeasons = async (): Promise<Season[]> => {
	const records = await db
		.select()
		.from(seasonsTable)
		.orderBy(desc(seasonsTable.start_date));
	return seasonsToDTOs(records);
};

export const findSeasonById = async (id: number): Promise<Season | null> => {
	const records = await db
		.select()
		.from(seasonsTable)
		.where(eq(seasonsTable.id, id));

	if (records.length === 0) return null;

	return seasonToDTO(records[0]);
};

export const findCurrentSeason = async (): Promise<Season | null> => {
	const now = new Date();
	const records = await db
		.select()
		.from(seasonsTable)
		.where(
			and(
				eq(seasonsTable.status, "active"),
				lte(seasonsTable.start_date, now),
				gte(seasonsTable.end_date, now)
			)
		)
		.orderBy(asc(seasonsTable.start_date))
		.limit(1);

	if (records.length === 0) return null;

	return seasonToDTO(records[0]);
};

export const findActiveSeasons = async (): Promise<Season[]> => {
	const records = await db
		.select()
		.from(seasonsTable)
		.where(eq(seasonsTable.status, "active"))
		.orderBy(desc(seasonsTable.start_date));

	return seasonsToDTOs(records);
};

export const findSeasonsInDateRange = async (
	startDate: Date,
	endDate: Date
): Promise<Season[]> => {
	const records = await db
		.select()
		.from(seasonsTable)
		.where(
			and(
				lte(seasonsTable.start_date, endDate),
				gte(seasonsTable.end_date, startDate)
			)
		)
		.orderBy(desc(seasonsTable.start_date));

	return seasonsToDTOs(records);
};

export const insertSeason = async (
	seasonData: Omit<SeasonRecord, "id" | "created_at" | "updated_at">
): Promise<Season> => {
	const [record] = await db
		.insert(seasonsTable)
		.values(seasonData)
		.returning();
	return seasonToDTO(record);
};

export const updateSeason = async (
	id: number,
	seasonData: Partial<SeasonRecord>
): Promise<Season | null> => {
	const result = await db
		.update(seasonsTable)
		.set({ ...seasonData, updated_at: new Date() })
		.where(eq(seasonsTable.id, id))
		.returning();

	if (result.length === 0) {
		return null;
	}

	return seasonToDTO(result[0]);
};

export const findUpcomingSeason = async (): Promise<Season | null> => {
	const now = new Date();
	const records = await db
		.select()
		.from(seasonsTable)
		.where(
			and(
				eq(seasonsTable.status, "upcoming"),
				gte(seasonsTable.start_date, now)
			)
		)
		.orderBy(asc(seasonsTable.start_date))
		.limit(1);

	if (records.length === 0) return null;

	return seasonToDTO(records[0]);
};
