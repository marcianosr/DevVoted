import { getActiveRunByUserId } from "~/domains/runs/api/queries";
import { endRunForThresholdFailure } from "~/domains/runs/services/runCompletion.service";
import {
	createPollResponse,
	fetchPollByIdWithOptions,
} from "~/domains/polls/api/queries";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";
import { resetPollRerolls } from "~/domains/runs/api/queries";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	type PollAnswerOutcome,
	PollScoreBreakdown,
} from "~/domains/score/services/score.service";
import type { PollOption } from "~/domains/polls/models/pollOption";
import { incrementRunProgress } from "~/domains/runs/services/progress.service";

export type PollAnswerResult = {
	runEnded: boolean;
	thresholdInfo: ThresholdInfo | null;
	selectedOptionIds: number[];
	correctOptionIds: number[];
	outcome: PollAnswerOutcome;
	breakdown: PollScoreBreakdown | null;
};

export type PollAnswerInput = {
	pollId: number;
	userId: string;
	selectedOptionIds: number[];
	categoryCode: string;
};

export const processPollAnswer = async (
	params: PollAnswerInput
): Promise<PollAnswerResult> => {
	const { pollId, userId, selectedOptionIds, categoryCode } = params;

	const { correctOptionIds, outcome, correctnessFactor } =
		await handleUserSelectedOptionsByPollType({
			pollId,
			selectedOptionIds,
		});

	const activeRun = await getActiveRunByUserId(userId);

	if (!activeRun) {
		return {
			correctOptionIds,
			selectedOptionIds,
			outcome,
			runEnded: false,
			thresholdInfo: null,
			breakdown: null,
		};
	}

	const { breakdown, newPollsAnswered } = await incrementRunProgress({
		categoryCode,
		run: activeRun,
		correctnessFactor,
	});

	await createPollResponse({
		pollId,
		userId,
		selectedOptionIds,
	});

	const updatedRun = await getActiveRunByUserId(userId);
	if (!updatedRun) throw new Error("Run not found after update");

	const updatedXPAfterAnsweringPoll = updatedRun.categoryXp.reduce(
		(sum, xp) => sum + xp.currentXp,
		0
	);

	const thresholdInfo = calculateThresholdInfo(
		updatedXPAfterAnsweringPoll,
		newPollsAnswered
	);

	let runEnded = false;

	if (thresholdInfo.isThresholdCheckPoll && !thresholdInfo.meetsThreshold) {
		await endRunForThresholdFailure(activeRun.id);
		runEnded = true;
	}

	await resetPollRerolls(activeRun.id);

	return {
		correctOptionIds,
		selectedOptionIds,
		outcome,
		runEnded,
		thresholdInfo,
		breakdown,
	};
};

const handleUserSelectedOptionsByPollType = async ({
	pollId,
	selectedOptionIds,
}: {
	pollId: number;
	selectedOptionIds: number[];
}) => {
	const pollWithOptions = await fetchPollByIdWithOptions(pollId);

	const selectedOptions = pollWithOptions.options.filter((option) =>
		selectedOptionIds.includes(option.id)
	);

	const correctOptions = pollWithOptions.options.filter(
		(option) => option.correct
	);
	const correctOptionIds = correctOptions.map((option) => option.id);

	const nCorrectPicked = selectedOptions.filter((option) =>
		correctOptionIds.includes(option.id)
	).length;
	const nCorrectTotal = correctOptions.length;
	const nWrongPicked = selectedOptions.length - nCorrectPicked;

	const { outcome, correctnessFactor } =
		pollWithOptions.poll.answerType === "single"
			? calculateSingleOutcome(selectedOptions, correctOptionIds)
			: calculateMultiOutcome(
					nCorrectPicked,
					nCorrectTotal,
					nWrongPicked
				);

	return {
		selectedOptions,
		correctOptionIds,
		outcome,
		correctnessFactor,
	};
};

const calculateSingleOutcome = (
	selectedOptions: PollOption[],
	correctOptionIds: number[]
) => {
	const isCorrect =
		selectedOptions.length === 1 &&
		correctOptionIds.includes(selectedOptions[0].id);

	return {
		outcome: outcomeSingle(isCorrect),
		correctnessFactor: singleCorrectnessFactor(isCorrect),
	};
};

const calculateMultiOutcome = (
	nCorrectPicked: number,
	nCorrectTotal: number,
	nWrongPicked: number
) => ({
	outcome: outcomeMulti(nCorrectPicked, nCorrectTotal, nWrongPicked),
	correctnessFactor: multiCorrectnessFactor(
		nCorrectPicked,
		nCorrectTotal,
		nWrongPicked
	),
});
