import {
	evaluatePollAnswer,
	type PollAnswerOutcome,
} from "~/domains/polls/services/pollAnswerEvaluation.service";
import type { Config } from "~/domains/economy/models/config.model";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";
import type { Rarity } from "~/ui/rarityColors";

// The per-option facts these helpers need. Satisfied by `CommunityOptionBreakdown`.
type OptionBreakdownLike = {
	optionId: number;
	optionText: string;
	isCorrect: boolean;
};

type ReviewRow = {
	id: string;
	text: string;
	correct: boolean;
	isYours: boolean;
};

/**
 * Whether the selection was fully correct, partial, or wrong — derived from the
 * community option breakdown (which carries per-option correctness) and the
 * user's picks. Reuses the shared answer-evaluation rules.
 */
export const evaluateSelectionOutcome = (
	optionBreakdown: OptionBreakdownLike[],
	selectedOptionIds: string[]
): PollAnswerOutcome => {
	const selected = new Set(selectedOptionIds);
	const isSelected = (o: OptionBreakdownLike) =>
		selected.has(o.optionId.toString());
	return evaluatePollAnswer({
		totalCorrect: optionBreakdown.filter((o) => o.isCorrect).length,
		selectedCorrect: optionBreakdown.filter((o) => o.isCorrect && isSelected(o))
			.length,
		selectedIncorrect: optionBreakdown.filter(
			(o) => !o.isCorrect && isSelected(o)
		).length,
	}).outcome;
};

/**
 * Per-option review rows: the option text, whether it is correct, and whether it
 * was the user's pick.
 */
export const buildAnswerReview = (
	optionBreakdown: OptionBreakdownLike[],
	selectedOptionIds: string[]
): ReviewRow[] => {
	const selected = new Set(selectedOptionIds);
	return optionBreakdown.map((o) => ({
		id: o.optionId.toString(),
		text: o.optionText,
		correct: o.isCorrect,
		isYours: selected.has(o.optionId.toString()),
	}));
};

type PerConfigCoverageEffect = {
	configId: string;
	coverageAdd: number;
	coverageMult: number;
};

type ScoreBonusRow = {
	label: string;
	value: number;
	rarity?: Rarity;
	description?: string;
};

type ScoreSummary = {
	isCorrect: boolean;
	baseCoverage: number;
	bonuses: ScoreBonusRow[];
	earnedCoverage: number;
	previousCoverage: number;
	newTotalCoverage: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

// A config's coverage contribution: its multiplier applied to the pre-config
// coverage, plus its flat add. Mirrors how scoring composes the two.
const configContribution = (
	effect: PerConfigCoverageEffect,
	coverageBeforeConfigs: number
): number =>
	round1(
		coverageBeforeConfigs * (effect.coverageMult - 1) + effect.coverageAdd
	);

/**
 * Breaks the poll's score into how the coverage was earned (base + per-config
 * and streak bonuses), the resulting category total, and the streak — the
 * detailed view shown beneath the answer review.
 */
export const buildScoreSummary = (
	score: ScoreCalculation,
	perConfigCoverageEffects: PerConfigCoverageEffect[],
	configs: Config[]
): ScoreSummary => {
	const { breakdown, newStreak } = score;
	const isCorrect = breakdown.earnedCoverage > 0;
	const coverageBeforeConfigs =
		breakdown.earnedCoverage - breakdown.configBonus;

	const configBonuses = perConfigCoverageEffects.map((effect) => {
		const config = configs.find((c) => c.id === effect.configId);
		return {
			label: config?.name ?? effect.configId,
			value: configContribution(effect, coverageBeforeConfigs),
			rarity: config?.rarity,
			description: config?.description,
		};
	});
	const streakBonusRows =
		breakdown.streakBonus !== 0
			? [
					{
						label: newStreak === 0 ? "Broken streak" : `Streak ${newStreak}×`,
						value: breakdown.streakBonus,
					},
				]
			: [];
	const bonuses = [...configBonuses, ...streakBonusRows];

	// Derive the base (answer) contribution as the remainder so the chips always
	// sum to the earned total. For a wrong answer this is the negative penalty —
	// configs can still push the net earned positive.
	const bonusTotal = round1(bonuses.reduce((sum, b) => sum + b.value, 0));
	const baseCoverage = round1(breakdown.earnedCoverage - bonusTotal);

	return {
		isCorrect,
		baseCoverage,
		bonuses,
		earnedCoverage: breakdown.earnedCoverage,
		previousCoverage: round1(score.newTotalCoverage - breakdown.earnedCoverage),
		newTotalCoverage: score.newTotalCoverage,
		currentStreak: newStreak,
		bestStreak: score.newBestStreak,
		pollsAnswered: score.newPollsAnswered,
	};
};
