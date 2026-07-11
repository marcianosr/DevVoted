import { isSameDay } from "date-fns";

import {
	getCommunityStatsForDailyPoll,
	getRandomAnswerForDailyPoll,
} from "~/domains/polls/api/communityStats.queries";
import { getLastGlobalDailyPollDate } from "~/domains/polls/api/dailyPoll.queries";
import { getDailyPollWithOptions } from "~/domains/polls/services/dailyPoll.service";
import {
	hasUserAnsweredPoll,
	getUserSelectedOptions,
	getPollHistory,
	getLastSeenBeforeCurrentRun,
	getTimesEncountered,
	trackPollView,
	trackPollAnswer,
	getPollsSeenInRun,
	getRunPollHistory,
} from "~/domains/polls/api/pollResponse.queries";
import { processTurn } from "~/domains/runs/services/turn.service";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import { getUserActiveRun } from "~/domains/runs/api/handlers";
import { fetchUserDisplayName } from "~/domains/users/api/queries";
import { handleApiOperation } from "~/utils/errorHandling";

export const getDailyPollHandler = async ({
	data,
}: {
	data: { userId?: string; date?: string; runId?: number };
}) => {
	return handleApiOperation(async () => {
		const { userId, runId, date } = data;

		const currentDate = date ?? new Date().toISOString().split("T")[0];
		const { poll, options } = await getDailyPollWithOptions(date);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(poll.id, userId)
			: false;

		const selectedOptions =
			userId && hasAnswered
				? await getUserSelectedOptions(poll.id, userId)
				: [];

		const creatorDisplayName = await fetchUserDisplayName(poll.createdBy);

		const lastSeenAt = await getLastGlobalDailyPollDate(poll.id, currentDate);

		let lastEncounteredAt: Date | null = null;
		let timesEncountered = 0;

		if (userId) {
			const resolvedRunId = await (async (): Promise<number> => {
				if (runId !== undefined) return runId;
				const activeRunResponse = await getUserActiveRun(userId);
				if (!activeRunResponse.success) {
					throw new Error(activeRunResponse.error);
				}
				return activeRunResponse.data.id;
			})();

			[lastEncounteredAt, timesEncountered] = await Promise.all([
				getLastSeenBeforeCurrentRun(userId, poll.id, resolvedRunId),
				getTimesEncountered(userId, poll.id),
			]);

			const history = await getPollHistory(resolvedRunId, poll.id);
			const hasSeenToday = history?.last_seen_at
				? isSameDay(new Date(history.last_seen_at), new Date())
				: false;

			if (!hasSeenToday && !hasAnswered) {
				await trackPollView(resolvedRunId, userId, poll.id);
			}
		}

		return {
			poll,
			options,
			hasAnswered,
			selectedOptions,
			creatorDisplayName,
			lastSeenAt,
			lastEncounteredAt,
			timesEncountered,
		};
	});
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	return handleApiOperation(async () => {
		const validatedData = await validatePollSubmission(data);

		const {
			runId,
			breakdown,
			newTotalCoverage,
			runEnded,
			selectedOptionIds,
			correctOptionIds,
			outcome,
			tryCatchUsed,
			pipelineEvaluation,
			evaluationContext,
			upgradeCards,
		} = await processTurn({
			pollId: validatedData.pollId,
			userId: validatedData.userId,
			selectedOptionIds: validatedData.selectedOptionIds,
			armedTryCatch: validatedData.armedTryCatch,
		});

		if (runId) {
			await trackPollAnswer(runId, validatedData.userId, validatedData.pollId);
		}

		return {
			message: "Options submitted successfully",
			selectOptions: selectedOptionIds,
			correctOptions: correctOptionIds,
			isCorrect: outcome === "full",
			runEnded,
			tryCatchUsed,
			breakdown,
			newTotalCoverage,
			pipelineEvaluation,
			evaluationContext,
			upgradeCards,
		};
	});
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
		const today = new Date().toISOString().split("T")[0];
		return await getCommunityStatsForDailyPoll(data.pollId, today);
	});
};

export const getRandomAnswerHandler = async ({
	data,
}: {
	data: { pollId: number };
}) => {
	return handleApiOperation(async () => {
		const today = new Date().toISOString().split("T")[0];
		return await getRandomAnswerForDailyPoll(data.pollId, today);
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

type ValidatedPollSubmission = {
	pollId: number;
	selectedOptions: string[];
	userId: string;
	selectedOptionIds: number[];
	armedTryCatch: boolean;
};

const validatePollSubmission = async (
	data: PollSubmissionInput
): Promise<ValidatedPollSubmission> => {
	const validatedData = pollSubmissionSchema.parse(data);
	const { pollId, selectedOptions, userId, armedTryCatch } = validatedData;

	const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
	if (hasAnswered) {
		throw new Error("You have already answered this poll");
	}

	return {
		pollId,
		selectedOptions,
		userId,
		selectedOptionIds: selectedOptions.map(Number),
		armedTryCatch: armedTryCatch ?? false,
	};
};
