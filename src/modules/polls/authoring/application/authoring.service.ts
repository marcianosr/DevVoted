import {
	createPollWithOptionsSchema,
	updatePollSchema,
	type CreatePollWithOptionsInput,
	type UpdatePollInput,
} from "~/modules/polls/authoring/application/poll.validation";
import {
	createPollWithOptions,
	updatePollWithOptions,
} from "~/modules/polls/authoring/infrastructure/authoring.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const createPollService = async (
	data: CreatePollWithOptionsInput & { createdBy: string }
) =>
	handleApiOperation(async () => {
		const validated = createPollWithOptionsSchema.parse(data);

		return createPollWithOptions(
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
	}, "createPoll");

export const updatePollService = async (data: UpdatePollInput) =>
	handleApiOperation(async () => {
		const validated = updatePollSchema.parse(data);

		return updatePollWithOptions(
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
	}, "updatePoll");
