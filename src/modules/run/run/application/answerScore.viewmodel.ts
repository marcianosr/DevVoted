import type { CoverageConfigBonus } from "~/modules/run/pipeline/domain/pipeline.model";
import {
	pollDifficultyMultiplier,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import type {
	AnsweredPoll,
	AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";

type AnswerVerdict = {
	readonly outcome: AnswerOutcome;
	readonly correctAnswers: readonly string[];
};

const latestAnswerVerdict = (view: RunView): AnswerVerdict | null => {
	const last = view.answeredThisGate.at(-1);
	if (!last) return null;
	return { outcome: last.outcome, correctAnswers: last.correct ?? [] };
};

type AnswerDifficulty = {
	readonly multiplier: number;
	readonly optionCount: number;
	readonly isMultiple: boolean;
};

export type AnswerScore = {
	readonly isCorrect: boolean;
	readonly baseCoverage: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
	readonly earnedCoverage: number;
	readonly difficulty?: AnswerDifficulty;
};

const answerDifficulty = (
	answered: AnsweredPoll
): AnswerDifficulty | undefined => {
	const optionCount = answered.options?.length;
	if (optionCount === undefined) return undefined;
	const isMultiple = answered.answerType === "multiple";
	const multiplier = roundToOneDecimal(
		pollDifficultyMultiplier(optionCount, isMultiple)
	);
	if (multiplier <= 1) return undefined;
	return { multiplier, optionCount, isMultiple };
};

export const latestAnswerScore = (view: RunView): AnswerScore | null => {
	const answered = view.answeredThisGate.at(-1);
	const breakdown = answered?.coverageBreakdown;
	if (!answered || !breakdown) return null;
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
		difficulty: answerDifficulty(answered),
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
