import { pollUserPerformanceTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

export type UserPerformance = {
	id: number;
	userId: string;
	categoryCode: string;
	bestXp: number;
	bestStreak: number;
	createdAt: Date;
	updatedAt: Date | null;
};

export type UserPerformanceRecord = InferSelectModel<typeof pollUserPerformanceTable>;

export const userPerformanceToDTO = (record: UserPerformanceRecord): UserPerformance => {
	return {
		id: record.id,
		userId: record.user_id,
		categoryCode: record.category_code,
		bestXp: record.best_xp,
		bestStreak: record.best_streak,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const userPerformanceFromDTO = (dto: UserPerformance): UserPerformanceRecord => {
	return {
		id: dto.id,
		user_id: dto.userId,
		category_code: dto.categoryCode,
		best_xp: dto.bestXp,
		best_streak: dto.bestStreak,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const userPerformancesToDTOs = (records: UserPerformanceRecord[]): UserPerformance[] => {
	return records.map(userPerformanceToDTO);
};

export const userPerformancesFromDTOs = (dtos: UserPerformance[]): UserPerformanceRecord[] => {
	return dtos.map(userPerformanceFromDTO);
};

export const createUserPerformance = (partial: Partial<UserPerformance> = {}): UserPerformance => {
	const now = new Date();
	
	return {
		id: 0,
		userId: "",
		categoryCode: "",
		bestXp: 0,
		bestStreak: 0,
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

export const userPerformanceFactory = {
	toDTO: userPerformanceToDTO,
	fromDTO: userPerformanceFromDTO,
	toDTOs: userPerformancesToDTOs,
	fromDTOs: userPerformancesFromDTOs,
	create: createUserPerformance,
};