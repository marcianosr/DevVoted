import {
	createPollWithOptions,
	updatePollWithOptions,
} from "~/domains/polls/api/poll.queries";
import { calculateCategoryWeights } from "~/domains/polls/services/categoryWeight.service";
import { getAllActiveConfigIds } from "~/domains/runs/api/shop.queries";
import {
	createPollWithOptionsSchema,
	updatePollSchema,
	type CreatePollWithOptionsInput,
	type UpdatePollInput,
} from "~/domains/polls/validation/schemas";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const createPollWithOptionsHandler = async ({
	data,
}: {
	data: CreatePollWithOptionsInput & { createdBy: string };
}) => {
	return handleApiOperation(async () => {
		const validated = createPollWithOptionsSchema.parse(data);

		return await createPollWithOptions(
			{
				question: validated.poll.question,
				status: validated.poll.status,
				answerType: validated.poll.answerType,
				createdBy: data.createdBy,
				categoryCode: validated.poll.categoryCode,
				codeBlock: validated.poll.codeBlock ?? null,
				codeSandboxExample: validated.poll.codeSandboxExample ?? null,
			},
			validated.options
		);
	}, "Failed to create poll");
};

export const updatePollHandler = async ({
	data,
}: {
	data: UpdatePollInput;
}) => {
	return handleApiOperation(async () => {
		const validated = updatePollSchema.parse(data);

		return await updatePollWithOptions(
			validated.id,
			{
				question: validated.poll.question,
				status: validated.poll.status,
				answerType: validated.poll.answerType,
				categoryCode: validated.poll.categoryCode,
				codeBlock: validated.poll.codeBlock,
				codeSandboxExample: validated.poll.codeSandboxExample,
				explanation: validated.poll.explanation,
			},
			validated.options
		);
	}, "Failed to update poll");
};

/**
 * Get current category weights based on all active configs across active runs.
 * These weights represent tomorrow's poll selection probabilities.
 */
export const getCategoryWeightsHandler = async () => {
	return handleApiOperation(async () => {
		const allActiveConfigIds = await getAllActiveConfigIds();
		return calculateCategoryWeights(allActiveConfigIds);
	});
};
