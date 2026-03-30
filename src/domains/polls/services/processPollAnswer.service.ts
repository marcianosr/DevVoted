import { applyEffects } from "~/domains/configs/data/configs";
import {
	createPollResponse,
	fetchPollByIdWithOptions,
	getPollsSeenInRun,
} from "~/domains/polls/api/queries";
import type { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import type { PollOption } from "~/domains/polls/models/pollOption";
import {
	getActiveRunByUserId,
	incrementCorrectPollsCount,
	resetPollRerolls,
} from "~/domains/runs/api/queries";
import { getChallengeModeOrDefault } from "~/domains/runs/data/challengeModes";
import type { Run } from "~/domains/runs/models/run";
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
import { getTodayDateString } from "~/lib/dateUtils";

export type PollAnswerResult = {
	runId: number | null;
	runEnded: boolean;
	thresholdInfo: ThresholdInfo | null;
	selectedOptionIds: number[];
	correctOptionIds: number[];
	outcome: PollAnswerOutcome;
	breakdown: PollScoreBreakdown | null;
	tryCatchUsed: boolean;
	victoryJustAchieved: boolean;
};

export type PollAnswerInput = {
	pollId: number;
	userId: string;
	selectedOptionIds: number[];
};

// ─── Stage types ─────────────────────────────────────────────────────────────

type PollContext = {
	poll: PollWithOptionsResponse["poll"];
	options: PollWithOptionsResponse["options"];
};

type CommitAnswerProgressParams = PollContext & {
	activeRun: Run;
	correctnessFactor: number;
	outcome: PollAnswerOutcome;
	userId: string;
	pollId: number;
	selectedOptionIds: number[];
};

type EvaluateGateStateParams = {
	activeRunId: number;
	updatedRun: Run;
};

type GateStateResult = {
	thresholdInfo: ThresholdInfo;
	victoryJustAchieved: boolean;
};

type ResolveRunStateParams = PollContext & {
	activeRunId: number;
	updatedRun: Run;
	thresholdInfo: ThresholdInfo;
};

type RunStateResult = {
	runEnded: boolean;
	tryCatchUsed: boolean;
};

// ─── Pipeline stages ──────────────────────────────────────────────────────────

const commitAnswerProgress = async ({
	activeRun,
	poll,
	options,
	correctnessFactor,
	outcome,
	userId,
	pollId,
	selectedOptionIds,
}: CommitAnswerProgressParams): Promise<{ breakdown: PollScoreBreakdown }> => {
	const { breakdown } = await incrementRunProgress({
		categoryCode: poll.categoryCode,
		run: activeRun,
		correctnessFactor,
		poll,
		options,
		hasAnswered: false,
	});

	if (outcome === "full") {
		await incrementCorrectPollsCount(activeRun.id);
	}

	await createPollResponse({
		pollId,
		userId,
		runId: activeRun.id,
		answerDate: getTodayDateString(),
		selectedOptionIds,
	});

	return { breakdown };
};

const evaluateGateState = async ({
	activeRunId,
	updatedRun,
}: EvaluateGateStateParams): Promise<GateStateResult> => {
	const challengeMode = getChallengeModeOrDefault(updatedRun.challengeModeId);
	const gates = challengeMode.gates;
	const totalPollsSeen = await getPollsSeenInRun(activeRunId);

	const thresholdInfo = calculateThresholdInfo(
		updatedRun.categoryCoverage,
		totalPollsSeen,
		gates
	);

	if (!thresholdInfo.meetsThreshold || !thresholdInfo.isThresholdCheckPoll) {
		return { thresholdInfo, victoryJustAchieved: false };
	}

	const { checkForVictory } =
		await import("~/domains/runs/services/runCompletion.service");
	const hasWon = checkForVictory(thresholdInfo.currentGate, gates);

	if (!hasWon || updatedRun.victoryAchievedAt) {
		return { thresholdInfo, victoryJustAchieved: false };
	}

	const { markVictoryAchieved } = await import("~/domains/runs/api/queries");
	await markVictoryAchieved(activeRunId);

	return { thresholdInfo, victoryJustAchieved: true };
};

const resolveRunState = async ({
	activeRunId,
	updatedRun,
	poll,
	options,
	thresholdInfo,
}: ResolveRunStateParams): Promise<RunStateResult> => {
	const { protection, resetRebuild } = applyEffects(
		{ poll, options, hasAnswered: true, run: updatedRun },
		updatedRun.activeConfigIds
	);

	if (resetRebuild) {
		await resetPollRerolls(activeRunId);
	}

	if (thresholdInfo.isThresholdCheckPoll) {
		await resetPollRerolls(activeRunId);
	}

	if (thresholdInfo.meetsThreshold) {
		return { runEnded: false, tryCatchUsed: false };
	}

	if (protection.tryCatch) {
		return { runEnded: false, tryCatchUsed: true };
	}

	await endRunForThresholdFailure(activeRunId);
	return { runEnded: true, tryCatchUsed: false };
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export const processPollAnswer = async (
	params: PollAnswerInput
): Promise<PollAnswerResult> => {
	const { pollId, userId, selectedOptionIds } = params;

	const { correctOptionIds, outcome, correctnessFactor, poll, options } =
		await handleUserSelectedOptionsByPollType({ pollId, selectedOptionIds });

	const activeRun = await getActiveRunByUserId(userId);

	if (!activeRun) {
		return {
			runId: null,
			correctOptionIds,
			selectedOptionIds,
			outcome,
			runEnded: false,
			thresholdInfo: null,
			breakdown: null,
			tryCatchUsed: false,
			victoryJustAchieved: false,
		};
	}

	const { breakdown } = await commitAnswerProgress({
		activeRun,
		poll,
		options,
		correctnessFactor,
		outcome,
		userId,
		pollId,
		selectedOptionIds,
	});

	const updatedRun = await getActiveRunByUserId(userId);
	if (!updatedRun) throw new Error("Run not found after update");

	const { thresholdInfo, victoryJustAchieved } = await evaluateGateState({
		activeRunId: activeRun.id,
		updatedRun,
	});

	const { runEnded, tryCatchUsed } = await resolveRunState({
		activeRunId: activeRun.id,
		updatedRun,
		poll,
		options,
		thresholdInfo,
	});

	return {
		runId: activeRun.id,
		correctOptionIds,
		selectedOptionIds,
		outcome,
		runEnded,
		thresholdInfo,
		breakdown,
		tryCatchUsed,
		victoryJustAchieved,
	};
};

// ─── Answer evaluation ────────────────────────────────────────────────────────

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
