import type { CategoryCode } from "~/shared/lib/categories";
import { formatKb } from "~/shared/lib/storage";

import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	CheckKind,
	Config,
	focusCoverageMultiplier,
} from "~/modules/run/config/domain/config.model";

export type CategoryTally = {
	readonly seen: number;
	readonly correct: number;
	/** Coverage gained in this category this window. Optional: pre-Config-Rule snapshots. */
	readonly gained?: number;
};

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
	/** Peeks bought this window. Doubles as the fee ladder's position, which is why
	 * the ladder and the peek demand reset together. Optional: legacy snapshots. */
	readonly peeked?: number;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	coverageGained: 0,
	leadingCorrect: 0,
	byCategory: {},
	missStreak: 0,
	maxMissStreak: 0,
	peeked: 0,
};

export type CheckState = "success" | "running" | "skipped" | "failed";

/**
 * What a check has to report right now, as the facts behind the sentence rather
 * than the sentence. Every variant names what it counts, because that is what
 * decides how it reads: a bare tally sits in the row's value column, prose drops
 * under the description. The screens own both the words and that placement
 * (`describeCheckProgress`) — the domain used to write the string and then sniff
 * its shape with a regex to guess the column back (DVTD-c0d0).
 */
export type CheckProgress =
	| {
			readonly kind: "answers";
			readonly current: number;
			readonly target: number;
	  }
	| {
			readonly kind: "coverage";
			readonly current: number;
			readonly target: number;
	  }
	| {
			readonly kind: "categories";
			readonly current: number;
			readonly target: number;
	  }
	| {
			readonly kind: "cover";
			readonly current: number;
			readonly target: number;
	  }
	| {
			readonly kind: "storage";
			readonly current: number;
			readonly target: number;
	  }
	| { readonly kind: "notSeen" }
	| { readonly kind: "missStreak"; readonly missed: number }
	| { readonly kind: "hidCheck"; readonly label: string }
	| { readonly kind: "checksFailing"; readonly count: number }
	/** The defeat device's lie, wrapping the tally it is lying about. */
	| {
			readonly kind: "reportedPassing";
			readonly actual?: Exclude<CheckProgress, { kind: "reportedPassing" }>;
	  };

export type CheckStatus = {
	readonly label: string;
	/** Live tally or remark; absent when there is nothing to report — a clean
	 * streak's dot already says all is well. */
	readonly progress?: CheckProgress;
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
	/** Storage held right now. A check may key off the balance (wiki §4.1), and
	 * one does: Moore's Law's floor. */
	readonly storageKb: number;
};

export type Effect = {
	requirementDelta?: number;
	rewardMultiplier?: number;
	storageOnClear?: number;
	storageInterestPct?: number;
	coverage?: (context: AnswerContext) => Coverage;
	maskWrongOn?: (category: CategoryCode) => boolean;
	gateCheck?: (context: EffectContext) => CheckStatus;
	demand?: (gatesCleared: number) => string;
};

export const touchesCoverage = (config: Config): boolean =>
	config.focusCategory !== undefined ||
	config.coverageMultiplier !== undefined ||
	config.coverageAdd !== undefined ||
	config.openerCoverageMultiplier !== undefined;

const coverageOf = (config: Config): Effect["coverage"] => {
	if (!touchesCoverage(config)) return undefined;
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
	// Flat clear payouts scale with level: Unit Tests pays +32KB × level.
	storageOnClear:
		config.storageOnClear === undefined
			? undefined
			: config.storageOnClear * (config.level ?? 1),
	storageInterestPct:
		config.storageInterestPct === undefined
			? undefined
			: config.storageInterestPct * (config.level ?? 1),
	requirementDelta:
		config.requirementDelta === 0 ? undefined : config.requirementDelta,
	rewardMultiplier:
		config.rewardMultiplier === 1 ? undefined : config.rewardMultiplier,
});

type GateCheckPart = Pick<Effect, "gateCheck" | "demand">;

const categoryList = (categories: readonly CategoryCode[]): string =>
	categories.length < 2
		? (categories[0] ?? "")
		: `${categories.slice(0, -1).join(", ")} or ${categories[categories.length - 1]}`;

/**
 * Competence in the categories a config claims. A Focus config claims one; a
 * linter claims the categories it can lint (ADR-022). Excused only by the draw:
 * if none of the categories appeared there is nothing to prove, so an unlucky
 * window never costs a gate. Nothing the player *chooses* can excuse it, which
 * is what stops a config owing the gate nothing.
 */
const masteryCheck = (
	config: Config,
	categories: readonly CategoryCode[]
): GateCheckPart => {
	const level = config.level ?? 1;
	return {
		gateCheck: ({ window }) => {
			const tallies = categories.map(
				(category) => window.byCategory[category] ?? { seen: 0, correct: 0 }
			);
			const seenCount = tallies.reduce((sum, tally) => sum + tally.seen, 0);
			const correct = tallies.reduce((sum, tally) => sum + tally.correct, 0);
			const seen = seenCount > 0;
			// The demand clamps to appearances — a level can never outnumber the
			// window, so an L10 mastery reads "every poll of the category, always".
			const target = seen ? Math.min(level, seenCount) : level;
			return {
				label: `${config.label} mastery`,
				progress: seen
					? { kind: "answers", current: correct, target }
					: { kind: "notSeen" },
				current: correct,
				target,
				state: checkState(correct >= target, window, !seen),
			};
		},
		demand: () =>
			level === 1
				? `${config.label}: get one right if ${categoryList(categories)} appears`
				: `${config.label}: get ${level} right if ${categoryList(categories)} appears`,
	};
};

// Checks do not escalate with gate depth — only Unit Tests' Correct check
// does (wiki §4.1: the only config whose check escalates).
const coverageGainCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 1;
	return {
		gateCheck: ({ window }) => ({
			label: "Coverage",
			progress: {
				kind: "coverage",
				current: window.coverageGained,
				target,
			},
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
				progress: {
					kind: "answers",
					current: Math.min(window.leadingCorrect, target),
					target,
				},
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
			progress: { kind: "answers", current: window.correct, target },
			current: window.correct,
			target,
			state: checkState(window.correct >= target, window),
		}),
		demand: () =>
			`${target} correct answer${target === 1 ? "" : "s"} this window`,
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
				worst >= 2 || (window.missStreak ?? 0) === 1
					? { kind: "missStreak", missed: Math.max(worst, 1) }
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
				progress: { kind: "categories", current: categoriesGained, target },
				current: categoriesGained,
				target,
				state: checkState(categoriesGained >= target, window),
			};
		},
		demand: () => `coverage gained in ${target} categories this window`,
	};
};

/**
 * Sticky in neither direction, unlike every other check here: the balance moves
 * while the window is open (a lint fee drains it, the faucet feeds it) and the
 * gate reads it once, after the storage bill. So a rich mid-window build is
 * unproven rather than passing, and a broke one is behind rather than dead.
 */
const storageFloorState = (window: GateWindow, met: boolean): CheckState => {
	if (window.answered < SLICE_WINDOW) return "running";
	return met ? "success" : "failed";
};

const storageFloorCheck = (config: Config): GateCheckPart => {
	// Both halves rise together, the same bargain every upgrade in the game makes.
	const target = (config.checkAmount ?? 0) * (config.level ?? 1);
	return {
		gateCheck: ({ window, storageKb }) => ({
			label: config.label,
			progress: { kind: "storage", current: storageKb, target },
			current: storageKb,
			target,
			state: storageFloorState(window, storageKb >= target),
		}),
		demand: () => `${formatKb(target)} held when the gate resolves`,
	};
};

/**
 * Telemetry's demand: buy the split at least `checkAmount` times a window. The
 * only check on the roster that asks the player to *spend* rather than to play
 * well, so it is priced in KB rather than in correctness — at one peek a window
 * that is the ladder's opening 32KB, which a cleared gate pays back.
 *
 * Standard `checkState`, unlike the correctness demand it replaced: success is
 * sticky (a bought peek cannot be unbought) and failure only lands when the
 * window closes short. Never skipped — carrying the config always owes the gate
 * the fee, which is exactly what makes it a demand rather than an option.
 */
const peekCountCheck = (config: Config): GateCheckPart => {
	const target = config.checkAmount ?? 1;
	return {
		gateCheck: ({ window }) => {
			const peeked = window.peeked ?? 0;
			return {
				label: config.label,
				progress: { kind: "answers", current: peeked, target },
				current: peeked,
				target,
				state: checkState(peeked >= target, window),
			};
		},
		demand: () => `${target} peek${target === 1 ? "" : "s"} this window`,
	};
};

type ContributedCheckKind = Exclude<CheckKind, "correct" | "defeat-device">;

const CHECK_BUILDERS: Record<
	ContributedCheckKind,
	(config: Config) => GateCheckPart
> = {
	"coverage-gain": coverageGainCheck,
	"cold-start": coldStartCheck,
	"min-correct": minCorrectCheck,
	"no-double-miss": noDoubleMissCheck,
	breadth: breadthCheck,
	"storage-floor": storageFloorCheck,
	"peek-count": peekCountCheck,
};

/** The check half: the requirement the config adds to the gate window. */
const checkOf = (config: Config): GateCheckPart => {
	if (config.focusCategory) return masteryCheck(config, [config.focusCategory]);
	// A linter owes competence in what it lints, never proof that it was used:
	// forcing the fee makes an unaffordable window fatal (ADR-031's trap rule).
	if (config.eliminatesWrongOptionsFor?.length)
		return masteryCheck(config, config.eliminatesWrongOptionsFor);
	// "correct" and "defeat-device" are synthesized by gate.model, which is the
	// only place with the whole checklist in hand: "correct" is present only
	// while a config carrying it (Unit Tests) is installed, and the defeat
	// device reads the other rows rather than adding a demand of its own.
	if (
		config.check === undefined ||
		config.check === "correct" ||
		config.check === "defeat-device"
	)
		return {};
	return CHECK_BUILDERS[config.check](config);
};

// The Config Rule (wiki §4.1): every config is Effect + Check, so an effect is
// the merge of two orthogonal derivations — never an either/or dispatch.
export const effectOf = (config: Config): Effect => ({
	...benefitOf(config),
	...checkOf(config),
});
