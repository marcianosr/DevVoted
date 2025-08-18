import { getActiveRunByUserId, awardXpToRun } from "~/domains/runs/api/queries";
import {
	checkXpThreshold,
	endRunForThresholdFailure,
} from "~/domains/runs/services/runCompletion.service";
import {
	createPollResponse,
	fetchPollByIdWithOptions,
} from "~/domains/polls/api/queries";
import {
	getCurrentRoundNumber,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";
import { resetPollRerolls } from "~/domains/runs/api/queries";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	calculateXP,
	getRoundXP,
	type PollAnswerOutcome,
} from "~/domains/score/services/score.service";

export type PollAnswerResult = {
	xpEarned: number;
	runEnded: boolean;
	thresholdInfo: ThresholdInfo | null;
	selectedOptionIds: number[];
	correctOptionIds: number[];
	outcome: PollAnswerOutcome;
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
	const pollWithOptions = await fetchPollByIdWithOptions(params.pollId);
	const selectedOptions = pollWithOptions.options.filter((option) =>
		selectedOptionIds.includes(option.id)
	);
	const pollType = pollWithOptions.poll.answerType;

	// Extract correct options from poll data
	const correctOptions = pollWithOptions.options.filter(
		(option) => option.correct
	);
	const correctOptionIds = correctOptions.map((option) => option.id);

	// Calculate scoring metrics
	const nCorrectPicked = selectedOptions.filter((option) =>
		correctOptionIds.includes(option.id)
	).length;
	const nCorrectTotal = correctOptions.length;
	const nWrongPicked = selectedOptions.length - nCorrectPicked;

	// Determine outcome and calculate XP
	let outcome: PollAnswerOutcome;
	let correctnessFactor: number;

	if (pollType === "single") {
		const isCorrect =
			selectedOptions.length === 1 &&
			correctOptionIds.includes(selectedOptions[0].id);
		outcome = outcomeSingle(isCorrect);
		correctnessFactor = singleCorrectnessFactor(isCorrect);
	} else {
		outcome = outcomeMulti(nCorrectPicked, nCorrectTotal, nWrongPicked);
		correctnessFactor = multiCorrectnessFactor(
			nCorrectPicked,
			nCorrectTotal,
			nWrongPicked
		);
	}

	await createPollResponse({
		pollId,
		userId,
		selectedOptionIds,
	});

	const { runEnded, thresholdInfo, xpEarned } = await handleXpFlow(
		userId,
		categoryCode,
		correctnessFactor
	);

	return {
		xpEarned,
		runEnded,
		thresholdInfo,
		selectedOptionIds,
		correctOptionIds,
		outcome,
	};
};

const handleXpFlow = async (
	userId: string,
	categoryCode: string,
	correctnessFactor: number
): Promise<{ runEnded: boolean; thresholdInfo: ThresholdInfo | null; xpEarned: number }> => {
	let runEnded = false;
	let thresholdInfo: ThresholdInfo | null = null;
	let xpEarned = 0;

	try {
		const activeRun = await getActiveRunByUserId(userId);
		if (!activeRun) return { runEnded, thresholdInfo, xpEarned };

		// Find the category XP data to get current polls answered
		const categoryXp = activeRun.categoryXp.find(xp => xp.categoryCode === categoryCode);
		if (!categoryXp) return { runEnded, thresholdInfo, xpEarned };

		// Calculate XP based on correctness factor and run context
		const upcomingPollsAnswered = categoryXp.pollsAnswered + 1; // Will be incremented in awardXpToRun
		const round = getCurrentRoundNumber(upcomingPollsAnswered);
		xpEarned = calculateXP(correctnessFactor, getRoundXP(round));

		// Always award XP regardless of set position
		await awardXpToRun(activeRun.id, categoryCode, xpEarned);

		// Reset reroll count for new shop session
		await resetPollRerolls(activeRun.id);

		// Always get threshold info for display purposes
		thresholdInfo = await checkXpThreshold(activeRun.id);

		// Only check threshold and potentially end run on 3rd poll of each set
		if (
			thresholdInfo.isThresholdCheckPoll &&
			!thresholdInfo.meetsThreshold
		) {
			await endRunForThresholdFailure(activeRun.id);
			runEnded = true;
		}
	} catch (error) {
		console.error("Error handling XP flow:", error);
	}

	return { runEnded, thresholdInfo, xpEarned };
};
