import type { InferSelectModel } from "drizzle-orm";

import type { pollOptionsTable } from "@/src/database/schema";

export type PollOptionRecord = InferSelectModel<typeof pollOptionsTable>;

export type PollOption = {
	id: number;
	pollId: number;
	option: string;
	correct: boolean;
};

export const pollOptionToDTO = (record: PollOptionRecord): PollOption => {
	return {
		id: record.id,
		pollId: record.poll_id,
		option: record.option,
		correct: record.correct,
	};
};

export const pollOptionFromDTO = (dto: PollOption): PollOptionRecord => {
	return {
		id: dto.id,
		poll_id: dto.pollId,
		option: dto.option,
		correct: dto.correct,
	};
};

export const pollOptionsToDTOs = (
	records: PollOptionRecord[]
): PollOption[] => {
	return records.map(pollOptionToDTO);
};

export const pollOptionsFromDTOs = (dtos: PollOption[]): PollOptionRecord[] => {
	return dtos.map(pollOptionFromDTO);
};

export const createPollOption = (
	partial: Partial<PollOption> = {}
): PollOption => {
	return {
		id: 0, // Will be assigned by database
		pollId: 0, // Must be set by caller
		option: "",
		correct: false,
		...partial,
	};
};

export const pollOptionFactory = {
	toDTO: pollOptionToDTO,
	fromDTO: pollOptionFromDTO,
	toDTOs: pollOptionsToDTOs,
	fromDTOs: pollOptionsFromDTOs,
	create: createPollOption,
};
