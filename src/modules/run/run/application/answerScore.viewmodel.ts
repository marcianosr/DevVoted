import type { CoverageConfigBonus } from "~/modules/run/build/domain/coverageRatio.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";
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

export type AnswerScore = {
	readonly isCorrect: boolean;
	readonly baseCoverage: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
	readonly earnedCoverage: number;
};

/** The post-submit beat: the answered poll stays on screen with its options
 * painted and the score beside them. One object because the three arrive
 * together — a reveal with only some of them is not a state the run can be in. */
export type AnswerReveal = {
	readonly correctOptionIds: readonly string[];
	readonly chosenOptionIds: readonly string[];
	readonly score?: AnswerScore;
};

export const latestAnswerScore = (view: RunView): AnswerScore | null => {
	const answered = view.answeredThisGate.at(-1);
	const breakdown = answered?.coverageBreakdown;
	if (!answered || !breakdown) return null;
	const { base, streakBonus, configBonuses } = breakdown;
	const earnedCoverage = roundToTwoDecimals(
		base +
			streakBonus +
			configBonuses.reduce((sum, bonus) => sum + bonus.value, 0)
	);
	return {
		isCorrect: answered.outcome !== "wrong",
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
