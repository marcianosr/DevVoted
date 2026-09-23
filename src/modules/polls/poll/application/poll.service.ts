import {
	fetchAllPolls,
	fetchPollByIdWithOptions,
	fetchPollCreators,
	fetchPollsByUser,
	hasUserAnsweredPoll,
} from "~/modules/polls/poll/infrastructure/poll.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const getPollByIdWithOptionsService = async ({
	id,
	userId,
}: {
	id: number;
	userId?: string;
}) =>
	handleApiOperation(async () => {
		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId ? await hasUserAnsweredPoll(id, userId) : false;

		return { poll, options, hasAnswered };
	});

export const getAllPollsService = async () =>
	handleApiOperation(async () => fetchAllPolls());

export const getPollsByUserService = async (userId: string) =>
	handleApiOperation(async () => fetchPollsByUser(userId));

export const getPollCreatorsService = async () =>
	handleApiOperation(async () => fetchPollCreators());
