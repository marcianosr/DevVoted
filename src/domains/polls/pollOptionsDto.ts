import { InferSelectModel } from "drizzle-orm";
import { pollOptionsTable } from "@/src/database/schema";

export type PollOptionsRecord = InferSelectModel<typeof pollOptionsTable>;

export type PollOption = {
	id: number;
	pollId: number;
	option: string;
	correct: boolean;
};

export const pollOptionToDTO = (record: PollOptionsRecord): PollOption => {
	return {
		id: record.id,
		pollId: record.poll_id,
		option: record.option,
		correct: record.correct,
	};
};

export const pollOptionFromDTO = (dto: PollOption): PollOptionsRecord => {
	return {
		id: dto.id,
		poll_id: dto.pollId,
		option: dto.option,
		correct: dto.correct,
	};
};

export const pollOptionsToDTOs = (
	records: PollOptionsRecord[]
): PollOption[] => {
	return records.map(pollOptionToDTO);
};

export const pollOptionsFromDTOs = (
	dtos: PollOption[]
): PollOptionsRecord[] => {
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
