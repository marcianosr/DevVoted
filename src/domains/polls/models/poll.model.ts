import type { InferSelectModel } from "drizzle-orm";

import type { pollsTable } from "@/src/database/schema";
import type { CategoryCode } from "~/shared/lib/categories";

import type { PollOption } from "./pollOption.model";

// Type for frontend usage (camelCase)

/**
 * Poll status values - derived from database schema enum
 * Use this constant for Zod schemas and UI dropdowns
 */
export const POLL_STATUSES = ["draft", "published", "archived"] as const;
export type PollStatus = (typeof POLL_STATUSES)[number];

export type AnswerType = "single" | "multiple";

export type Poll = {
	id: number;
	question: string;
	status: PollStatus;
	answerType: AnswerType;
	openingTime: Date;
	closingTime: Date;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCode: CategoryCode;
	codeSandboxExample: string | null;
	codeBlock: string | null;
	explanation: string | null;
	pollNumber: number | null;
};

export type PollRecord = InferSelectModel<typeof pollsTable>;

/**
 * API response type for poll with options and answer status
 * Used by backend handlers and frontend components
 */
export type PollWithOptionsResponse = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
};

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
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
		categoryCode: record.category_code as CategoryCode,
		codeSandboxExample: record.code_sandbox_example,
		codeBlock: record.code_block,
		explanation: record.explanation,
		pollNumber: record.poll_number,
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
		code_sandbox_example: dto.codeSandboxExample,
		code_block: dto.codeBlock,
		explanation: dto.explanation,
		poll_number: dto.pollNumber,
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
		categoryCode: "js" as CategoryCode, // Default value, can be overridden by partial
		codeSandboxExample: null,
		codeBlock: null,
		explanation: null,
		pollNumber: null,
		...partial,
	};
};

export const pollFactory = {
	toDTO: pollToDTO,
	fromDTO: pollFromDTO,
	toDTOs: pollsToDTOs,
	fromDTOs: pollsFromDTOs,
	create: createPoll,
};
