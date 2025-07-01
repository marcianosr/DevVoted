import { InferSelectModel } from "drizzle-orm";
import { pollResponseOptionsTable } from "@/src/database/schema";

export type PollResponseOptionRecord = InferSelectModel<
	typeof pollResponseOptionsTable
>;

export type PollResponseOption = {
	responseId: number;
	optionId: number;
};

export const pollResponseOptionToDTO = (
	record: PollResponseOptionRecord
): PollResponseOption => {
	return {
		responseId: record.response_id,
		optionId: record.option_id,
	};
};

export const pollResponseOptionFromDTO = (
	dto: PollResponseOption
): PollResponseOptionRecord => {
	return {
		response_id: dto.responseId,
		option_id: dto.optionId,
	};
};

export const pollResponseOptionsToDTOs = (
	records: PollResponseOptionRecord[]
): PollResponseOption[] => {
	return records.map(pollResponseOptionToDTO);
};

export const pollResponseOptionsFromDTOs = (
	dtos: PollResponseOption[]
): PollResponseOptionRecord[] => {
	return dtos.map(pollResponseOptionFromDTO);
};

export const pollResponseOptionFactory = {
	toDTO: pollResponseOptionToDTO,
	fromDTO: pollResponseOptionFromDTO,
	toDTOs: pollResponseOptionsToDTOs,
	fromDTOs: pollResponseOptionsFromDTOs,
};
