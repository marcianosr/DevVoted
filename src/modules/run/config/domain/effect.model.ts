import type { CategoryCode } from "~/domains/shared/categories";

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

/**
 * A linter's window record. `offered` counts the polls it *could* have run on
 * (its category, with more than one wrong option to cross out); `polls` and
 * `correct` count what it actually pledged. The gap between them is a declined
 * pledge, which ADR-022 treats as a failure rather than a skip — otherwise a
 * linter that is never run owes nothing and clears every gate for free.
 * `offered` is optional: pre-ADR-022 snapshots hydrate without it and read as
 * "never offered", so an in-flight run keeps the old excused-skip behaviour.
 */
export type LintTally = {
	readonly offered?: number;
	readonly polls: number;
	readonly correct: number;
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
	storageOnClear?: number;
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
	return {
		gateCheck: ({ window }) => {
			const tally = window.byCategory[focusCategory] ?? {
				seen: 0,
				correct: 0,
			};
			const seen = tally.seen > 0;
			// The demand clamps to appearances — a level can never outnumber the
			// window, so an L10 mastery reads "every poll of the category, always".
			const target = seen ? Math.min(level, tally.seen) : level;
			return {
				label: `${config.label} mastery`,
				progress: seen ? `${tally.correct}/${target}` : "not seen",
				current: tally.correct,
				target,
				state: checkState(tally.correct >= target, window, !seen),
			};
		},
		demand: () =>
			level === 1
				? `${config.label}: get one right if ${focusCategory} appears`
				: `${config.label}: get ${level} right if ${focusCategory} appears`,
	};
};

// Checks do not escalate with gate depth — only Unit Tests' Correct check
// does (wiki §4.1: the only config whose check escalates).
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

const windowClosed = (window: GateWindow): boolean =>
	window.answered >= SLICE_WINDOW;

/**
 * The linter's verdict. Three cases the old rule collapsed into one "skipped":
 *
 * 1. **Never offered** (`offered === 0`) — no poll of its category turned up, or
 *    none had two wrong options to cross out. Unavoidable, so still `skipped`:
 *    an unlucky draw must never cost a gate.
 * 2. **Offered and declined** (`offered > 0`, `polls === 0`) — the chance came
 *    and the pledge was not taken. ADR-022 makes this a failure, since a linter
 *    that is never run is a config that owes nothing.
 * 3. **Pledged** (`polls > 0`) — every linted poll must be correct.
 *
 * TODO(marciano): implement. The rule choice is in case 2, and it decides when
 * the verdict lands:
 *
 *   (a) *one offer redeems the window* — a later lintable poll can still take
 *       the pledge, so a declined poll only fails once the window closes
 *       (`windowClosed(window)`), and stays "running" until then. One fee per
 *       window.
 *   (b) *every offer must be taken* — the first declined poll fails on the
 *       spot, like `coldStartCheck`'s broken opening streak. One fee per
 *       lintable poll, so a JS-heavy window gets expensive fast.
 *
 * Keep case 3's existing shape: a fail is immediate (`correct < polls`), a
 * success waits for the close, because a later lint could still break it.
 */
const lintState = (tally: LintTally, window: GateWindow): CheckState => {
	if (tally.polls === 0) return "skipped";
	if (tally.correct < tally.polls) return "failed";
	return windowClosed(window) ? "success" : "running";
};

const lintProgress = (tally: LintTally): string | undefined => {
	if (tally.polls > 0) return `${tally.correct}/${tally.polls}`;
	// "not linted" reads as an excuse; when the chance was there and passed up,
	// the row has to say the pledge was owed.
	return (tally.offered ?? 0) > 0 ? "declined the lint" : "not linted";
};

const lintCorrectCheck = (config: Config): GateCheckPart => ({
	gateCheck: ({ window }) => {
		const tally = window.lintedByConfig?.[config.id] ?? {
			offered: 0,
			polls: 0,
			correct: 0,
		};
		return {
			label: `${config.label} linted`,
			progress: lintProgress(tally),
			current: tally.correct,
			target: tally.polls,
			state: lintState(tally, window),
		};
	},
	demand: () => `answer every ${config.label}-linted poll correctly`,
});

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
	"lint-correct": lintCorrectCheck,
};

/** The check half: the requirement the config adds to the gate window. */
const checkOf = (config: Config): GateCheckPart => {
	if (config.focusCategory) return focusCheck(config, config.focusCategory);
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
