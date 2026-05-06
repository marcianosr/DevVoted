import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	fetchPollsByUser,
	fetchPollCreators,
} from "~/domains/polls/api/poll.queries";
import { hasUserAnsweredPoll } from "~/domains/polls/api/pollResponse.queries";
import { handleApiOperation } from "~/utils/errorHandling";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number; userId?: string };
}) => {
	return handleApiOperation(async () => {
		const { id, userId } = data;
		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId ? await hasUserAnsweredPoll(id, userId) : false;
		return { poll, options, hasAnswered };
	});
};

export const getPollByIdHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	return handleApiOperation(async () => {
		return await getPollOrError(data.id);
	});
};

export const getAllPollsHandler = async () => {
	return handleApiOperation(async () => {
		return await fetchAllPolls();
	});
};

export const getPollsByUserHandler = async ({
	data,
}: {
	data: { userId: string };
}) => {
	return handleApiOperation(async () => {
		return await fetchPollsByUser(data.userId);
	});
};

export const getPollCreatorsHandler = async () => {
	return handleApiOperation(async () => {
		return await fetchPollCreators();
	});
};

const getPollOrError = async (id: number) => {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
};
