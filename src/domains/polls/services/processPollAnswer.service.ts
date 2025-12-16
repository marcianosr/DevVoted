import { removeConfigFromRunQuery } from "~/domains/configs/api/queries";
import { applyEffects } from "~/domains/configs/data/configs";
import {
	createPollResponse,
	fetchPollByIdWithOptions,
	getPollsSeenInRun,
} from "~/domains/polls/api/queries";
import type { PollOption } from "~/domains/polls/models/pollOption";
import {
	getActiveRunByUserId,
	resetPollRerolls,
} from "~/domains/runs/api/queries";
import { getChallengeModeOrDefault } from "~/domains/runs/data/challengeModes";
import { incrementRunProgress } from "~/domains/runs/services/progress.service";
import { endRunForThresholdFailure } from "~/domains/runs/services/runCompletion.service";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	type PollAnswerOutcome,
	PollScoreBreakdown,
} from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";

export type PollAnswerResult = {
	runEnded: boolean;
	thresholdInfo: ThresholdInfo | null;
	selectedOptionIds: number[];
	correctOptionIds: number[];
	outcome: PollAnswerOutcome;
	breakdown: PollScoreBreakdown | null;
	tryCatchUsed?: boolean;
};

export type PollAnswerInput = {
	pollId: number;
	userId: string;
	selectedOptionIds: number[];
	categoryCode: CategoryCode;
};

export const processPollAnswer = async (
	params: PollAnswerInput
): Promise<PollAnswerResult> => {
	const { pollId, userId, selectedOptionIds, categoryCode } = params;

	const { correctOptionIds, outcome, correctnessFactor, poll, options } =
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
			tryCatchUsed: false,
		};
	}

	const { breakdown } = await incrementRunProgress({
		categoryCode,
		run: activeRun,
		correctnessFactor,
		poll,
		options,
		hasAnswered: false, // At this point, the answer is being submitted (not yet saved)
	});

	await createPollResponse({
		pollId,
		userId,
		selectedOptionIds,
	});

	const updatedRun = await getActiveRunByUserId(userId);
	if (!updatedRun) throw new Error("Run not found after update");

	// Get challenge mode gates for this run
	const challengeMode = getChallengeModeOrDefault(updatedRun.challengeModeId);
	const gates = challengeMode.gates;

	// Fetch total polls seen in current run for threshold calculation
	const totalPollsSeen = await getPollsSeenInRun(activeRun.id);

	// Calculate threshold based on category coverage data, seen polls, and challenge mode gates
	const thresholdInfo = calculateThresholdInfo(
		updatedRun.categoryCoverage,
		totalPollsSeen,
		gates
	);

	let runEnded = false;
	let tryCatchUsed = false;

	// TODO: Refactor this so we can handle endless config possibilities
	// This is done for now like so because of MVP
	// Check if try/catch protection should prevent run failure
	// Check for victory at CI gates (when last defined gate is passed)
	if (thresholdInfo.meetsThreshold && thresholdInfo.isThresholdCheckPoll) {
		const { checkForVictory, completeRunWithVictory } =
			await import("~/domains/runs/services/runCompletion.service");
		const hasWon = checkForVictory(thresholdInfo.currentGate, gates);
		if (hasWon) {
			await completeRunWithVictory(activeRun.id);
			runEnded = true;
		}
	}

	// Apply config effects to see if try/catch is active
	const effectCtx = {
		poll,
		options,
		hasAnswered: true,
		run: updatedRun,
	};

	const { protection, resetRebuild } = applyEffects(
		effectCtx,
		updatedRun.activeConfigIds
	);

	if (!thresholdInfo.meetsThreshold) {
		if (protection.tryCatch) {
			// Try/Catch saves the run! Remove the config since it's one-time use
			await removeConfigFromRunQuery(activeRun.id, ["try-catch-config"]);
			tryCatchUsed = true;
			// Don't end the run - try/catch saved it
		} else {
			// No protection, end the run normally
			await endRunForThresholdFailure(activeRun.id);
			runEnded = true;
		}
	}

	if (resetRebuild) {
		// Reset rebuilds after every poll if the effect is active
		await resetPollRerolls(activeRun.id);
	}

	// Only reset rerolls when reaching a CI gate (every POLLS_PER_ROUND poll)
	if (thresholdInfo.isThresholdCheckPoll) {
		await resetPollRerolls(activeRun.id);
	}

	return {
		correctOptionIds,
		selectedOptionIds,
		outcome,
		runEnded,
		thresholdInfo,
		breakdown,
		tryCatchUsed,
	};
};

export const handleUserSelectedOptionsByPollType = async ({
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
			: calculateMultiOutcome(nCorrectPicked, nCorrectTotal, nWrongPicked);

	return {
		selectedOptions,
		correctOptionIds,
		outcome,
		correctnessFactor,
		poll: pollWithOptions.poll,
		options: pollWithOptions.options,
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
