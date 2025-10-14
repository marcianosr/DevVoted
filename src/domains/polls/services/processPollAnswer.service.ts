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
import { CategoryCode } from "~/domains/shared/categories";
import { applyEffects } from "~/domains/configs/data/configs";
import { removeConfigFromRunQuery } from "~/domains/configs/api/queries";

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

	// Calculate threshold based on category coverage data
	const thresholdInfo = calculateThresholdInfo(updatedRun.categoryCoverage);

	let runEnded = false;
	let tryCatchUsed = false;

	// TODO: Refactor this so we can handle endless config possibilities
	// This is done for now like so because of MVP
	// Check if try/catch protection should prevent run failure
	if (!thresholdInfo.meetsThreshold) {
		// Apply config effects to see if try/catch is active
		const effectCtx = {
			poll,
			options,
			hasAnswered: true,
			run: updatedRun,
		};

		const { protection } = applyEffects(
			effectCtx,
			updatedRun.activeConfigIds
		);

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

	await resetPollRerolls(activeRun.id);

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
