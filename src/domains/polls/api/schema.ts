import { pollsTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

// Type for frontend usage (camelCase)
export type Poll = {
	id: number;
	question: string;
	status: "draft" | "needs-revision" | "open" | "closed" | "archived";
	answerType: "single" | "multiple";
	openingTime: Date;
	closingTime: Date;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCode: string;
};

export type PollRecord = InferSelectModel<typeof pollsTable>;

/**
 * Functions to convert between database records and frontend DTOs
 */

/**
 * Converts a database record (snake_case) to a frontend DTO (camelCase)
 */
export const pollToDTO = (record: PollRecord): Poll => {
	return {
		id: record.id,
		question: record.question,
		status: record.status,
		answerType: record.answer_type,
		openingTime: record.opening_time,
		closingTime: record.closing_time,
		createdBy: record.created_by,
		createdAt: record.created_at,
		updatedAt: record.updated_at,
		categoryCode: record.category_code,
	};
};

/**
 * Convert a frontend DTO to a database record
 */
export const pollFromDTO = (dto: Poll): PollRecord => {
	return {
		id: dto.id,
		question: dto.question,
		status: dto.status,
		answer_type: dto.answerType,
		opening_time: dto.openingTime,
		closing_time: dto.closingTime,
		created_by: dto.createdBy,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt || null, // Handle potential null values
		category_code: dto.categoryCode,
	};
};

/**
 * Converts an array of database records to frontend DTOs
 */
export const pollsToDTOs = (records: PollRecord[]): Poll[] => {
	return records.map(pollToDTO);
};

/**
 * Converts an array of frontend DTOs to database records
 */
export const pollsFromDTOs = (dtos: Poll[]): PollRecord[] => {
	return dtos.map(pollFromDTO);
};

/**
 * Creates a new poll with default values
 */
export const createPoll = (partial: Partial<Poll> = {}): Poll => {
	const now = new Date();
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return {
		id: 0, // Will be assigned by database
		question: "",
		status: "draft",
		answerType: "single",
		openingTime: now,
		closingTime: tomorrow,
		createdBy: "", // Must be set by caller
		createdAt: now,
		updatedAt: now, // Default to now, can be overridden by partial
		categoryCode: "", // Must be set by caller
		...partial,
	};
};

// For backward compatibility
export const pollFactory = {
	toDTO: pollToDTO,
	fromDTO: pollFromDTO,
	toDTOs: pollsToDTOs,
	fromDTOs: pollsFromDTOs,
	create: createPoll,
};
