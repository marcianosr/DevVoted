import type { CategoryCode } from "~/domains/shared/categories";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
	canRunLinter,
	lintApplies,
	LINT_COST,
	rebuildCost,
	type RunPoll,
	type RunState,
	type RunStatus,
} from "../climb/run.model";
import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { checkStatuses, gateDemands } from "../gate/gate.model";
import {
	canAddSlot,
	type CoverageConfigBonus,
	coverageForAnswer,
	coverageProfileFor,
	coverageToAddSlot,
	linterFor,
	rewardMultiplierFor,
} from "../pipeline/pipeline.model";
import {
	GATE_REWARD_KB,
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "../rules.model";

export type PollOptionView = { readonly id: string; readonly label: string };

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
};

export type RunView = {
	readonly status: RunStatus;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly newConfigIds: readonly string[];
	readonly stripsRemaining: number;
	readonly poll: PollView | null;
	readonly disabledOptionIds: readonly string[];
	readonly canLint: boolean;
	readonly lintReady: boolean;
	readonly lintCost: number;
	readonly linter: Config | null;
	readonly rebuildCost: number;
	readonly canRebuild: boolean;
	readonly slotCoverageRequired: number;
	readonly canAddSlot: boolean;
	readonly checks: readonly CheckStatus[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly passedChecks: readonly CheckStatus[];
	readonly demands: readonly string[];
	readonly rewardMultiplier: number;
	readonly coverageMultiplier: number;
	readonly coverageAdd: number;
	readonly gateReward: number;
	readonly gatesCleared: number;
	readonly victoryGate: number;
	readonly pollsToGate: number;
	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly coverageGainedThisGate: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly log: readonly string[];
};

export type AnswerVerdict = {
	readonly outcome: AnswerOutcome;
	readonly correctAnswers: readonly string[];
};

/**
 * The verdict of the answer just submitted — the freshest entry in the gate's
 * answer log. Older snapshots may lack `correct`; the verdict then only
 * carries the outcome.
 */
export const latestAnswerVerdict = (view: RunView): AnswerVerdict | null => {
	const last = view.answeredThisGate.at(-1);
	if (!last) return null;
	return { outcome: last.outcome, correctAnswers: last.correct ?? [] };
};

/**
 * Ids of the answered poll's correct options, for the post-submit reveal.
 * `poll` is the poll as it was on screen (pre-advance view); `answered` is the
 * server response that recorded the answer. Labels bridge the two — the
 * redacted view strips per-option correctness, and the answer log only keeps
 * labels.
 */
export type AnswerScore = {
	readonly isCorrect: boolean;
	readonly baseCoverage: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
	readonly earnedCoverage: number;
};

/**
 * The just-answered poll's coverage as the reveal's chip equation needs it:
 * base + streak + per-config, plus the summed total. Null for snapshots taken
 * before breakdowns existed. A miss reads as a negative base (the penalty).
 */
export const latestAnswerScore = (view: RunView): AnswerScore | null => {
	const breakdown = view.answeredThisGate.at(-1)?.coverageBreakdown;
	if (!breakdown) return null;
	const { base, streakBonus, configBonuses } = breakdown;
	const earnedCoverage = roundToOneDecimal(
		base +
			streakBonus +
			configBonuses.reduce((sum, bonus) => sum + bonus.value, 0)
	);
	return {
		isCorrect: base >= 0,
		baseCoverage: base,
		streakBonus,
		configBonuses,
		earnedCoverage,
	};
};

export const correctOptionIdsFor = (
	poll: PollView,
	answered: RunView
): readonly string[] => {
	const verdict = latestAnswerVerdict(answered);
	if (!verdict) return [];
	return poll.options
		.filter((option) => verdict.correctAnswers.includes(option.label))
		.map((option) => option.id);
};

const gainedThisGate = (state: RunState): Record<string, number> => {
	const gained: Record<string, number> = {};
	for (const poll of state.answeredThisGate) {
		// The engine records the actual earn per answer; recomputing (for
		// pre-coverageEarned snapshots) can't know partial shares, so it
		// falls back to full-or-nothing.
		const earned =
			poll.coverageEarned ??
			coverageForAnswer(
				state.pipeline.configs,
				poll.category,
				poll.outcome === "correct" ? 1 : 0
			);
		if (earned > 0)
			gained[poll.category] = roundToOneDecimal(
				(gained[poll.category] ?? 0) + earned
			);
	}
	return gained;
};

const redactPoll = (poll: RunPoll): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	answerType: poll.answerType,
	options: poll.options.map((option) => ({
		id: option.id,
		label: option.label,
	})),
});

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	const nextRebuildCost = rebuildCost(state.rebuildsUsed);
	return {
		status: state.status,
		slots: state.pipeline.slots,
		configs: state.pipeline.configs,
		available: state.available,
		draftOptions: state.draftOptions,
		newConfigIds: state.draftedThisGate,
		stripsRemaining: state.stripsRemaining,
		poll: state.status === "answering" && current ? redactPoll(current) : null,
		// Only options the player paid to lint off — no automatic masking.
		disabledOptionIds: state.manualDisabled,
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		lintCost: LINT_COST,
		rebuildCost: nextRebuildCost,
		canRebuild: state.storage >= nextRebuildCost,
		slotCoverageRequired: coverageToAddSlot(state.pipeline.slots),
		canAddSlot: canAddSlot(state.pipeline.slots, state.coverage),
		linter:
			current === undefined
				? null
				: (linterFor(state.pipeline.configs, current.category) ?? null),
		checks: checkStatuses(state.pipeline, state.window, state.gatesCleared),
		answeredThisGate: state.answeredThisGate,
		passedChecks: state.clearedChecks,
		demands: gateDemands(state.pipeline, state.gatesCleared),
		rewardMultiplier: rewardMultiplierFor(state.pipeline),
		coverageMultiplier: coverageProfileFor(state.pipeline).mult,
		coverageAdd: coverageProfileFor(state.pipeline).add,
		gateReward: Math.round(
			GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
		),
		gatesCleared: state.gatesCleared,
		victoryGate: VICTORY_GATE,
		pollsToGate: SLICE_WINDOW - state.window.answered,
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		streak: state.streak,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		coverageGainedThisGate: gainedThisGate(state),
		storage: state.storage,
		log: state.log,
	};
};
