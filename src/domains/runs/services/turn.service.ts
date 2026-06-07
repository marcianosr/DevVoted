import { applyEffects } from "~/domains/economy/data/configs";
import { fetchPollByIdWithOptions } from "~/domains/polls/api/poll.queries";
import type { PollWithOptionsResponse } from "~/domains/polls/models/poll.model";
import type { PollOption } from "~/domains/polls/models/pollOption.model";
import {
	createPollResponse,
	getAnsweredPollsCountInRun,
} from "~/domains/polls/api/pollResponse.queries";
import { getWindowResults } from "~/domains/runs/api/window.queries";
import {
	awardStorage,
	clearPendingUpgradeCards,
	getActiveRunByUserId,
	resetPollRerolls,
	savePendingUpgradeCards,
} from "~/domains/runs/api/run.queries";
import { incrementCorrectPollsCount } from "~/domains/runs/api/coverage.queries";
import type { UpgradeCard } from "~/domains/runs/models/pipeline.model";
import type { Run } from "~/domains/runs/models/run.model";
import { incrementRunProgress } from "~/domains/runs/services/progress.service";
import { generateUpgradeCards } from "~/domains/runs/services/pipeline.service";
import {
	evaluatePipeline,
	getWindowSize,
	type PipelineEvaluation,
	type PipelineEvaluationContext,
	buildCategoryPollResults,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { endRunForThresholdFailure } from "~/domains/runs/services/runCompletion.service";
import {
	evaluatePollAnswer,
	type PollAnswerOutcome,
} from "~/domains/polls/services/pollAnswerEvaluation.service";
import {
	outcomeSingle,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	PollScoreBreakdown,
} from "~/domains/runs/services/score.service";
import { getTodayDateString } from "~/lib/dateUtils";

export type PollAnswerResult = {
	runId: number | null;
	runEnded: boolean;
	selectedOptionIds: number[];
	correctOptionIds: number[];
	outcome: PollAnswerOutcome;
	breakdown: PollScoreBreakdown | null;
	newTotalCoverage: number | null;
	tryCatchUsed: boolean;
	pipelineEvaluation: PipelineEvaluation | null;
	evaluationContext: PipelineEvaluationContext | null;
	upgradeCards: UpgradeCard[];
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

type EvaluatePipelineParams = {
	activeRunId: number;
	updatedRun: Run;
	userId: string;
	totalPollsAnswered: number;
	gateNumber: number;
};

type PipelineStageResult = {
	pipelineEvaluation: PipelineEvaluation | null;
	evaluationContext: PipelineEvaluationContext | null;
	upgradeCards: UpgradeCard[];
};

type ResolveRunStateParams = PollContext & {
	activeRunId: number;
	updatedRun: Run;
	pipelineEvaluation: PipelineEvaluation | null;
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
}: CommitAnswerProgressParams): Promise<{
	breakdown: PollScoreBreakdown;
	newTotalCoverage: number;
}> => {
	const scoreCalculation = await incrementRunProgress({
		categoryCode: poll.categoryCode,
		run: activeRun,
		correctnessFactor,
		poll,
		options,
		hasAnswered: false,
	});

	const { breakdown, newTotalCoverage } = scoreCalculation;

	if (outcome === "full") {
		await incrementCorrectPollsCount(activeRun.id);
	}

	await createPollResponse({
		pollId,
		userId,
		runId: activeRun.id,
		answerDate: getTodayDateString(),
		selectedOptionIds,
		coverageDelta: breakdown.delta,
		scoreBreakdown: scoreCalculation,
	});

	return { breakdown, newTotalCoverage };
};

const resolveRunState = async ({
	activeRunId,
	updatedRun,
	poll,
	options,
	pipelineEvaluation,
}: ResolveRunStateParams): Promise<RunStateResult> => {
	const { protection, resetRebuild } = applyEffects(
		{ poll, options, hasAnswered: true, run: updatedRun },
		updatedRun.activeConfigIds
	);

	if (resetRebuild) {
		await resetPollRerolls(activeRunId);
	}

	if (pipelineEvaluation !== null) {
		await resetPollRerolls(activeRunId);
	}

	if (pipelineEvaluation === null || pipelineEvaluation.passed) {
		return { runEnded: false, tryCatchUsed: false };
	}

	if (protection.tryCatch) {
		return { runEnded: false, tryCatchUsed: true };
	}

	const failedSlots = pipelineEvaluation.slotEvaluations
		.filter((e) => !e.passed)
		.map((e) => ({
			gateTypeId: e.slot.gateTypeId,
			difficulty: e.slot.difficulty,
			requirement: e.slot.requirement,
		}));

	await endRunForThresholdFailure(activeRunId, failedSlots);
	return { runEnded: true, tryCatchUsed: false };
};

const evaluatePipelineStage = async ({
	activeRunId,
	updatedRun,
	userId,
	totalPollsAnswered,
	gateNumber,
}: EvaluatePipelineParams): Promise<PipelineStageResult> => {
	const { pipelineSlots } = updatedRun;
	const windowSize = getWindowSize(pipelineSlots);
	const isPipelineCheckPoll =
		totalPollsAnswered > 0 && totalPollsAnswered % windowSize === 0;

	const pollsInCurrentWindow = isPipelineCheckPoll
		? windowSize
		: totalPollsAnswered % windowSize;

	const windowResults =
		pollsInCurrentWindow > 0
			? await getWindowResults(activeRunId, userId, pollsInCurrentWindow)
			: [];

	const chronologicalWindowResults = [...windowResults].reverse();
	let firstConsecutiveCorrectFromWindowStart = 0;
	for (const r of chronologicalWindowResults) {
		if (!r.isCorrect) break;
		firstConsecutiveCorrectFromWindowStart++;
	}

	const ctx: PipelineEvaluationContext = {
		correctAnswersInWindow: windowResults.filter((r) => r.isCorrect).length,
		pollsAnsweredInWindow: windowResults.length,
		coverageGainedInWindow: windowResults.reduce(
			(sum, r) => sum + r.coverageDelta,
			0
		),
		currentStreakAtWindowEnd: Math.max(
			...updatedRun.categoryCoverage.map((c) => c.currentStreak),
			0
		),
		pollsInWindow: windowSize,
		currentGate: Math.floor(totalPollsAnswered / windowSize) + 1,
		firstConsecutiveCorrectFromWindowStart,
		categoryPollResults: buildCategoryPollResults(windowResults),
	};

	if (!isPipelineCheckPoll) {
		return {
			pipelineEvaluation: null,
			evaluationContext: ctx,
			upgradeCards: [],
		};
	}

	const pipelineEvaluation = evaluatePipeline(ctx, pipelineSlots);

	if (!pipelineEvaluation.passed) {
		await clearPendingUpgradeCards(activeRunId);
		return { pipelineEvaluation, evaluationContext: ctx, upgradeCards: [] };
	}

	if (pipelineEvaluation.totalReward > 0) {
		await awardStorage(activeRunId, pipelineEvaluation.totalReward);
	}

	const availableCategories = updatedRun.categoryCoverage.map(
		(c) => c.categoryCode
	);
	const upgradeCards = generateUpgradeCards(
		pipelineSlots,
		gateNumber,
		availableCategories
	);

	if (upgradeCards.length > 0) {
		await savePendingUpgradeCards(activeRunId, upgradeCards);
	}

	return { pipelineEvaluation, evaluationContext: ctx, upgradeCards };
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export const processTurn = async (
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
			breakdown: null,
			newTotalCoverage: null,
			tryCatchUsed: false,
			pipelineEvaluation: null,
			evaluationContext: null,
			upgradeCards: [],
		};
	}

	const { breakdown, newTotalCoverage } = await commitAnswerProgress({
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

	const totalPollsAnswered = await getAnsweredPollsCountInRun(activeRun.id);

	const windowSize = getWindowSize(updatedRun.pipelineSlots);
	const { pipelineEvaluation, evaluationContext, upgradeCards } =
		await evaluatePipelineStage({
			activeRunId: activeRun.id,
			updatedRun,
			userId,
			totalPollsAnswered,
			gateNumber: Math.floor(totalPollsAnswered / windowSize),
		});

	const { runEnded, tryCatchUsed } = await resolveRunState({
		activeRunId: activeRun.id,
		updatedRun,
		poll,
		options,
		pipelineEvaluation,
	});

	return {
		runId: activeRun.id,
		correctOptionIds,
		selectedOptionIds,
		outcome,
		runEnded,
		breakdown,
		newTotalCoverage,
		tryCatchUsed,
		pipelineEvaluation,
		evaluationContext,
		upgradeCards,
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
	outcome: evaluatePollAnswer({
		selectedCorrect: nCorrectPicked,
		selectedIncorrect: nWrongPicked,
		totalCorrect: nCorrectTotal,
	}).outcome,
	correctnessFactor: multiCorrectnessFactor(
		nCorrectPicked,
		nCorrectTotal,
		nWrongPicked
	),
});
