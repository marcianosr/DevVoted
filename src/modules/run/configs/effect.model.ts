import type { CategoryCode } from "~/domains/shared/categories";

import { SLICE_WINDOW } from "../rules.model";
import { CheckKind, Config, focusCoverageMultiplier } from "./config.model";

export type CategoryTally = {
	readonly seen: number;
	readonly correct: number;
	/** Coverage gained in this category this window. Optional: pre-Config-Rule snapshots. */
	readonly gained?: number;
};

export type LintTally = { readonly polls: number; readonly correct: number };

export type GateWindow = {
	readonly correct: number;
	readonly answered: number;
	readonly coverageGained: number;
	readonly leadingCorrect: number;
	readonly byCategory: Readonly<Record<string, CategoryTally>>;
	/** Consecutive misses right now — a correct resets it, a partial holds it. Optional: legacy snapshots. */
	readonly missStreak?: number;
	/** Worst miss run this window — reaching 2 permanently fails no-double-miss. Optional: legacy snapshots. */
	readonly maxMissStreak?: number;
	/** Lint usage per linter config id: polls linted, and how many of those were answered correctly. */
	readonly lintedByConfig?: Readonly<Record<string, LintTally>>;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	coverageGained: 0,
	leadingCorrect: 0,
	byCategory: {},
	missStreak: 0,
	maxMissStreak: 0,
	lintedByConfig: {},
};

export type CheckState = "success" | "running" | "skipped" | "failed";

export type CheckStatus = {
	readonly label: string;
	/** Live tally or remark; absent when there is nothing to report — a clean
	 * streak's dot already says all is well. */
	readonly progress?: string;
	readonly current: number;
	readonly target: number;
	readonly state: CheckState;
	readonly sourceConfigId?: string;
	readonly description?: string;
};

export const checkState = (
	met: boolean,
	window: GateWindow,
	skipped = false
): CheckState =>
	skipped
		? "skipped"
		: met
			? "success"
			: window.answered >= SLICE_WINDOW
				? "failed"
				: "running";

export type Coverage = { readonly mult: number; readonly add: number };

export type AnswerContext = {
	readonly category: CategoryCode;
	/** Polls already answered in this window — 0 marks the window's opener. */
	readonly answeredBefore: number;
};

export type EffectContext = {
	readonly window: GateWindow;
	readonly gatesCleared: number;
};

export type Effect = {
	requirementDelta?: number;
	rewardMultiplier?: number;
	faucetPerCorrect?: number;
	storageOnClear?: number;
	coverage?: (context: AnswerContext) => Coverage;
	maskWrongOn?: (category: CategoryCode) => boolean;
	gateCheck?: (context: EffectContext) => CheckStatus;
	demand?: (gatesCleared: number) => string;
};

const coverageOf = (config: Config): Effect["coverage"] => {
	const touchesCoverage =
		config.focusCategory !== undefined ||
		config.coverageMultiplier !== undefined ||
		config.coverageAdd !== undefined ||
		config.openerCoverageMultiplier !== undefined;
	if (!touchesCoverage) return undefined;
	const level = config.level ?? 1;
	return ({ category, answeredBefore }) => ({
		mult:
			(config.focusCategory === category ? focusCoverageMultiplier(level) : 1) *
			(config.coverageMultiplier ?? 1) *
			(answeredBefore === 0 ? (config.openerCoverageMultiplier ?? 1) : 1),
		add: config.coverageAdd ?? 0,
	});
};

const maskOf = (config: Config): Effect["maskWrongOn"] => {
	const categories = config.eliminatesWrongOptionsFor;
	if (!categories) return undefined;
	return (category) => categories.includes(category);
};

/** The benefit half: derived purely from which benefit fields the config sets. */
const benefitOf = (config: Config): Effect => ({
	coverage: coverageOf(config),
	maskWrongOn: maskOf(config),
	faucetPerCorrect: config.storagePerCorrect,
	storageOnClear: config.storageOnClear,
	requirementDelta:
		config.requirementDelta === 0 ? undefined : config.requirementDelta,
	rewardMultiplier:
		config.rewardMultiplier === 1 ? undefined : config.rewardMultiplier,
});

type GateCheckPart = Pick<Effect, "gateCheck" | "demand">;

const focusCheck = (
	config: Config,
	focusCategory: CategoryCode
): GateCheckPart => {
	const level = config.level ?? 1;
	console.log(config);
	return {
		gateCheck: ({ window }) => {
			const tally = window.byCategory[focusCategory] ?? {
				seen: 0,
				correct: 0,
			};
			const seen = tally.seen > 0;
			return {
				label: `${config.label} mastery`,
				progress: seen ? `${tally.correct}/${level}` : "not seen",
				current: tally.correct,
				target: level,
				state: checkState(tally.correct >= level, window, !seen),
			};
		},
		demand: () => `${config.label}: get one right if ${focusCategory} appears`,
	};
};

// Checks do not escalate with gate depth — only the baseline Correct check
// does (wiki §4.1: Unit Tests is the only config whose check escalates).
const coverageGainCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 1;
	return {
		gateCheck: ({ window }) => ({
			label: "Coverage",
			progress: `${window.coverageGained}%/${target}%`,
			current: window.coverageGained,
			target,
			state: checkState(window.coverageGained >= target, window),
		}),
		demand: () => `+${target}% coverage this window`,
	};
};

const coldStartCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 1;
	return {
		gateCheck: ({ window }) => {
			const met = window.leadingCorrect >= target;
			// A broken opening streak can never recover — fail on the spot.
			const broken = !met && window.answered > window.leadingCorrect;
			return {
				label: "Cold start",
				progress: `${Math.min(window.leadingCorrect, target)}/${target}`,
				current: window.leadingCorrect,
				target,
				state: broken ? "failed" : checkState(met, window),
			};
		},
		demand: () =>
			target === 1
				? "your first answer correct"
				: `your first ${target} answers correct`,
	};
};

const minCorrectCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 1;
	return {
		gateCheck: ({ window }) => ({
			label: config.label,
			progress: `${window.correct}/${target}`,
			current: window.correct,
			target,
			state: checkState(window.correct >= target, window),
		}),
		demand: () => `${target} correct answers this window`,
	};
};

// Not checkState(): failure is sticky here (a double miss never washes out)
// while success is provisional until the window closes — the inverse of the
// sticky-success checks like coverage-gain.
const noDoubleMissState = (window: GateWindow): CheckState => {
	if ((window.maxMissStreak ?? 0) >= 2) return "failed";
	if (window.answered >= SLICE_WINDOW) return "success";
	return "running";
};

const noDoubleMissCheck = (config: Config): GateCheckPart => ({
	gateCheck: ({ window }) => {
		const worst = window.maxMissStreak ?? 0;
		return {
			label: config.label,
			// A clean streak reports nothing — "steady" said what the running dot
			// already says. Only the warning and the verdict are worth a line.
			progress:
				worst >= 2
					? "missed 2 in a row"
					: (window.missStreak ?? 0) === 1
						? "1 miss — the next one fails"
						: undefined,
			current: worst,
			target: 1,
			state: noDoubleMissState(window),
		};
	},
	demand: () => "never two misses in a row",
});

const breadthCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 2;
	return {
		gateCheck: ({ window }) => {
			const categoriesGained = Object.values(window.byCategory).filter(
				(tally) => (tally.gained ?? 0) > 0
			).length;
			return {
				label: config.label,
				progress: `${categoriesGained}/${target} categories`,
				current: categoriesGained,
				target,
				state: checkState(categoriesGained >= target, window),
			};
		},
		demand: () => `coverage gained in ${target} categories this window`,
	};
};

const lintState = (tally: LintTally, window: GateWindow): CheckState => {
	if (tally.polls === 0) return "skipped";
	if (tally.correct < tally.polls) return "failed";
	// All linted polls correct so far — but a later lint could still fail this,
	// so success only lands when the window closes.
	if (window.answered >= SLICE_WINDOW) return "success";
	return "running";
};

const lintCorrectCheck = (config: Config): GateCheckPart => ({
	gateCheck: ({ window }) => {
		const tally = window.lintedByConfig?.[config.id] ?? {
			polls: 0,
			correct: 0,
		};
		return {
			label: `${config.label} linted`,
			progress:
				tally.polls === 0 ? "not linted" : `${tally.correct}/${tally.polls}`,
			current: tally.correct,
			target: tally.polls,
			state: lintState(tally, window),
		};
	},
	demand: () => `answer every ${config.label}-linted poll correctly`,
});

type ContributedCheckKind = Exclude<CheckKind, "correct">;

const CHECK_BUILDERS: Record<
	ContributedCheckKind,
	(config: Config) => GateCheckPart
> = {
	"coverage-gain": coverageGainCheck,
	"cold-start": coldStartCheck,
	"min-correct": minCorrectCheck,
	"no-double-miss": noDoubleMissCheck,
	breadth: breadthCheck,
	"lint-correct": lintCorrectCheck,
};

/** The check half: the requirement the config adds to the gate window. */
const checkOf = (config: Config): GateCheckPart => {
	if (config.focusCategory) return focusCheck(config, config.focusCategory);
	// "correct" is the baseline check — gate.model synthesizes it so a bare
	// pipeline still demands answers; the config only carries its amount.
	if (config.check === undefined || config.check === "correct") return {};
	return CHECK_BUILDERS[config.check](config);
};

// The Config Rule (wiki §4.1): every config is Effect + Check, so an effect is
// the merge of two orthogonal derivations — never an either/or dispatch.
export const effectOf = (config: Config): Effect => ({
	...benefitOf(config),
	...checkOf(config),
});
