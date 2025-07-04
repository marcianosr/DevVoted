import { InferSelectModel } from "drizzle-orm";
import { pollResponseOptionsTable } from "@/src/database/schema";

export type PollResponseOptionRecord = InferSelectModel<
	typeof pollResponseOptionsTable
>;

export type PollResponseOptionInsert = Omit<PollResponseOptionRecord, 'id'>;

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
): PollResponseOptionInsert => {
	return {
		response_id: dto.responseId,
		option_id: Number(dto.optionId),
	};
};

export const pollResponseOptionToDTOs = (
	records: PollResponseOptionRecord[]
): PollResponseOption[] => {
	return records.map(pollResponseOptionToDTO);
};

export const pollResponseOptionFromDTOs = (
	dtos: PollResponseOption[]
): PollResponseOptionInsert[] => {
	return dtos.map(pollResponseOptionFromDTO);
};

export const pollResponseOptionFactory = {
	toDTO: pollResponseOptionToDTO,
	fromDTO: pollResponseOptionFromDTO,
	toDTOs: pollResponseOptionToDTOs,
	fromDTOs: pollResponseOptionFromDTOs,
};
