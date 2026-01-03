import { isSameDay } from "date-fns";

import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	fetchPollsByUser,
	hasUserAnsweredPoll,
	getUserSelectedOptions,
	getPollHistory,
	trackPollView,
	trackPollAnswer,
	getPollsSeenInRun,
	getCommunityStatsForDailyPoll,
	getRandomAnswerForDailyPoll,
	getRunPollHistory,
	createPollWithOptions,
	updatePollWithOptions,
} from "~/domains/polls/api/queries";
import { getDailyPollWithOptions } from "~/domains/polls/services/dailyPoll.service";
import { processPollAnswer } from "~/domains/polls/services/processPollAnswer.service";
import {
	pollSubmissionSchema,
	createPollWithOptionsSchema,
	updatePollSchema,
	type PollSubmissionInput,
	type CreatePollWithOptionsInput,
	type UpdatePollInput,
} from "~/domains/polls/validation/schemas";
import { getUserActiveRun } from "~/domains/runs/api/handlers";
import { Run } from "~/domains/runs/models/run";
import { getRunProgress } from "~/domains/runs/services/progress.service";
import { fetchUserDisplayName } from "~/domains/users/api/queries";
import { handleApiOperation } from "~/utils/errorHandling";

import { Poll } from "../models/poll";
import { PollOption } from "../models/pollOption";

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

export const getDailyPollHandler = async ({
	data,
}: {
	data: { userId?: string; date?: string; runId?: number };
}) => {
	return handleApiOperation(async () => {
		const { userId, runId, date: _date } = data;

		const { poll, options } = await getDailyPollWithOptions("2025-02-20");
		const hasAnswered = userId
			? await hasUserAnsweredPoll(poll.id, userId)
			: false;

		const selectedOptions =
			userId && hasAnswered
				? await getUserSelectedOptions(poll.id, userId)
				: [];

		const creatorDisplayName = await fetchUserDisplayName(poll.createdBy);

		// Track poll view only if not seen today
		if (userId) {
			// Use provided runId if available, otherwise fetch it
			let activeRunId = runId;
			if (!activeRunId) {
				const activeRunResponse = await getUserActiveRun(userId);
				if (!activeRunResponse.success) {
					throw new Error(activeRunResponse.error);
				}
				activeRunId = activeRunResponse.data.id;
			}

			const history = await getPollHistory(activeRunId, poll.id);
			const hasSeenToday = history?.last_seen_at
				? isSameDay(new Date(history.last_seen_at), new Date())
				: false;

			if (!hasSeenToday) {
				await trackPollView(activeRunId, userId, poll.id);
			}
		}

		return { poll, options, hasAnswered, selectedOptions, creatorDisplayName };
	});
};

export const getScoreBreakdownHandler = async ({
	data,
}: {
	data: {
		selectedOptions: string[];
		poll: Poll;
		options: PollOption[];
		hasAnswered: boolean;
		run: Run;
	};
}) => {
	return handleApiOperation(async () => {
		const { poll, options, hasAnswered, run, selectedOptions } = data;

		const score = await getRunProgress({
			selectedOptions,
			run,
			poll,
			options,
			hasAnswered,
		});

		return score;
	});
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	return handleApiOperation(async () => {
		const validatedData = await validatePollSubmission(data);

		const activeRunResponse = await getUserActiveRun(validatedData.userId);
		if (!activeRunResponse.success) {
			throw new Error(activeRunResponse.error);
		}

		// TODO: The start of posting to the DB (answers)
		const {
			breakdown,
			runEnded,
			thresholdInfo,
			selectedOptionIds,
			correctOptionIds,
			outcome,
		} = await processPollAnswer({
			pollId: validatedData.pollId,
			userId: validatedData.userId,
			selectedOptionIds: validatedData.selectedOptionIds,
			categoryCode: validatedData.poll.categoryCode,
		});

		// Track poll answer
		await trackPollAnswer(
			activeRunResponse.data.id,
			validatedData.userId,
			validatedData.pollId
		);

		// TODO: check when score breakdown can be removed here
		return {
			message: "Options submitted successfully",
			selectOptions: selectedOptionIds,
			correctOptions: correctOptionIds,
			isCorrect: outcome === "full",
			runEnded,
			breakdown,
			thresholdInfo,
		};
	});
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}

type ValidatedPollSubmission = {
	pollId: number;
	selectedOptions: string[];
	userId: string;
	selectedOptionIds: number[];
	poll: NonNullable<Awaited<ReturnType<typeof fetchPollById>>>;
};

const validatePollSubmission = async (
	data: PollSubmissionInput
): Promise<ValidatedPollSubmission> => {
	const validatedData = pollSubmissionSchema.parse(data);
	const { pollId, selectedOptions, userId } = validatedData;

	const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
	if (hasAnswered) {
		throw new Error("You have already answered this poll");
	}

	const poll = await fetchPollById(pollId);
	if (!poll) {
		throw new Error("Poll not found");
	}

	const selectedOptionIds = selectedOptions.map((option) => Number(option));

	return {
		pollId,
		selectedOptions,
		userId,
		selectedOptionIds,
		poll,
	};
};

export const getPollsSeenInRunHandler = async ({
	data,
}: {
	data: { runId: number };
}) => {
	return handleApiOperation(async () => {
		return await getPollsSeenInRun(data.runId);
	});
};

export const getCommunityStatsHandler = async ({
	data,
}: {
	data: { pollId: number };
}) => {
	return handleApiOperation(async () => {
		const { pollId } = data;
		const today = new Date().toISOString().split("T")[0];

		return await getCommunityStatsForDailyPoll(pollId, today);
	});
};

export const getRandomAnswerHandler = async ({
	data,
}: {
	data: { pollId: number };
}) => {
	return handleApiOperation(async () => {
		const { pollId } = data;
		const today = new Date().toISOString().split("T")[0];

		return await getRandomAnswerForDailyPoll(pollId, today);
	});
};

export const getRunPollHistoryHandler = async ({
	data,
}: {
	data: { userId: string; runId: number };
}) => {
	return handleApiOperation(async () => {
		return await getRunPollHistory(data.runId, data.userId);
	});
};

// ============================================
// Poll CRUD Handlers
// ============================================

export const createPollWithOptionsHandler = async ({
	data,
}: {
	data: CreatePollWithOptionsInput & { createdBy: string };
}) => {
	return handleApiOperation(async () => {
		const validated = createPollWithOptionsSchema.parse(data);

		const poll = await createPollWithOptions(
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

		return poll;
	}, "Failed to create poll");
};

export const updatePollHandler = async ({
	data,
}: {
	data: UpdatePollInput;
}) => {
	return handleApiOperation(async () => {
		const validated = updatePollSchema.parse(data);

		const poll = await updatePollWithOptions(
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

		return poll;
	}, "Failed to update poll");
};
