import { InferSelectModel } from "drizzle-orm";

import { pollResponsesTable } from "@/src/database/schema";

export type PollResponseRecord = InferSelectModel<typeof pollResponsesTable>;

export type PollResponse = {
	responseId: number;
	pollId: number;
	userId: string | null;
	runId: number | null;
	answerDate: string;
	createdAt: Date | null;
	updatedAt: Date | null;
};

export const pollResponseToDTO = (record: PollResponseRecord): PollResponse => {
	return {
		responseId: record.response_id,
		pollId: record.poll_id,
		userId: record.user_id ?? null,
		runId: record.run_id ?? null,
		answerDate: record.answer_date,
		createdAt: record.created_at ?? null,
		updatedAt: record.updated_at ?? null,
	};
};

export const pollResponseFromDTO = (dto: PollResponse): PollResponseRecord => {
	return {
		response_id: dto.responseId,
		poll_id: dto.pollId,
		user_id: dto.userId ?? null,
		run_id: dto.runId ?? null,
		answer_date: dto.answerDate,
		coverage_delta: null,
		score_breakdown: null,
		created_at: dto.createdAt ?? null,
		updated_at: dto.updatedAt ?? null,
	};
};

export const pollResponsesToDTOs = (
	records: PollResponseRecord[]
): PollResponse[] => {
	return records.map(pollResponseToDTO);
};

export const pollResponsesFromDTOs = (
	dtos: PollResponse[]
): PollResponseRecord[] => {
	return dtos.map(pollResponseFromDTO);
};

export const pollResponseFactory = {
	toDTO: pollResponseToDTO,
	fromDTO: pollResponseFromDTO,
	toDTOs: pollResponsesToDTOs,
	fromDTOs: pollResponsesFromDTOs,
};
