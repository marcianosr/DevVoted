/**
 * Vertical-slice prototype (throwaway) for the session-run + tags loop — see DVTD-88si.
 *
 * Pure mechanics only. Proves the tag tension and the strip-on-fail failure model
 * are fun BEFORE any production wiring. Tags are grounded in DevVoted's real configs.
 */
import type { CategoryCode } from "~/shared/lib/categories";

export type TagFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

/**
 * Extra gate conditions a check-config imposes on top of the baseline correct-answers check.
 * Each is a different lens on the same window; stacking them makes the gate harder AND pays more.
 * - coverage-gain: needs +N% coverage this window
 * - cold-start: needs the first N answers correct
 * - speed: needs N fast answers
 * - mirrored: inverted — needs N WRONG answers
 */
export type CheckKind = "coverage-gain" | "cold-start" | "speed" | "mirrored";

/** Loot tier — shown as the config's glow, not its fill. Ascending scarcity/impact. */
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Tag = {
	readonly id: string;
	readonly label: string;
	readonly family: TagFamily;
	/** Loot tier. Defaults to "common" when unset. */
	readonly rarity?: Rarity;
	/** Player-facing one-liner: what this sticker does. */
	readonly description: string;
	/** Risk raises the gate's required correct answers; nothing lowers it now — Defense helps you answer instead. */
	readonly requirementDelta: number;
	/** Risk pays extra storage on a pass (multiplied across equipped Risk tags). */
	readonly rewardMultiplier: number;
	/** Focus: category this pipeline specialises in (1.5× coverage on matching correct answers). */
	readonly focusCategory?: CategoryCode;
	/** Defense (yarn.lock): this pipeline's requirement can never be raised. */
	readonly immuneToRaise?: boolean;
	/** Defense (ESLint/Stylelint): disables (crosses out) a wrong option on polls in these categories. */
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	/** Amplify (Copilot): multiplies coverage earned on this pipeline. */
	readonly coverageMultiplier?: number;
	/** Amplify (Code Coverage): flat coverage added per correct answer. */
	readonly coverageAdd?: number;
	/** Focus level (raised by drafting the same tag again): scales coverage and the correct answers it demands. Defaults to 1. */
	readonly level?: number;
	/** Economy (IndexedDB): storage earned per correct answer — a faucet feeding rerolls. */
	readonly storagePerCorrect?: number;
	/** Check tag: adds a gate condition of this kind (the gate passes only if all checks pass). */
	readonly check?: CheckKind;
	/** Threshold for the check (coverage %, cold-start count, …). */
	readonly checkAmount?: number;
};

/** Starter tag set, grounded in DevVoted's real configs. */
export const SLICE_TAGS = {
	// Focus — file-extension specialists: big coverage in their category, but if it appears you must nail one. Upgradable.
	js: {
		id: "js",
		label: ".js",
		family: "focus",
		description: "JS polls pay 1.5× — but if JS shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "js",
	},
	ts: {
		id: "ts",
		label: ".ts",
		family: "focus",
		description: "TS polls pay 1.5× — but if TS shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "ts",
	},
	css: {
		id: "css",
		label: ".css",
		family: "focus",
		description:
			"CSS polls pay 1.5× — but if CSS shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "css",
	},
	jsx: {
		id: "jsx",
		label: ".jsx",
		family: "focus",
		description:
			"React polls pay 1.5× — but if React shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "react",
	},
	git: {
		id: "git",
		label: ".git",
		family: "focus",
		description:
			"Git polls pay 1.5× — but if Git shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "git",
	},
	rb: {
		id: "rb",
		label: ".rb",
		family: "focus",
		description:
			"Ruby polls pay 1.5× — but if Ruby shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "ruby",
	},
	html: {
		id: "html",
		label: ".html",
		family: "focus",
		description:
			"HTML polls pay 1.5× — but if HTML shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "html",
	},
	java: {
		id: "java",
		label: ".java",
		family: "focus",
		description:
			"Java polls pay 1.5× — but if Java shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "java",
	},
	// Defense — linters disable a wrong option (devDependency help)
	eslint: {
		id: "eslint",
		label: "ESLint",
		family: "defense",
		description: "Disables one wrong answer on JS/TS polls",
		requirementDelta: 0,
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["js", "ts"],
	},
	stylelint: {
		id: "stylelint",
		label: "Stylelint",
		family: "defense",
		description: "Disables one wrong answer on CSS polls.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["css"],
	},
	intellisense: {
		id: "intellisense",
		label: "Intellisense",
		family: "defense",
		rarity: "uncommon",
		description: "Disables one wrong answer on React/TS polls.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["react", "ts"],
	},
	// Defense — lock the gate difficulty
	yarnLock: {
		id: "yarn-lock",
		label: "yarn.lock",
		family: "defense",
		rarity: "rare",
		description: "This gate can never get harder.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		immuneToRaise: true,
	},
	// Amplify — the greed
	copilot: {
		id: "copilot",
		label: "Copilot",
		family: "amplify",
		rarity: "rare",
		description: "All coverage on this pipeline ×2.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageMultiplier: 2,
	},
	codeCoverage: {
		id: "code-coverage",
		label: "Code Coverage",
		family: "amplify",
		rarity: "uncommon",
		description: "+0.5% flat coverage per correct answer.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageAdd: 0.5,
	},
	// Economy — a storage faucet that funds rerolls
	indexedDb: {
		id: "indexed-db",
		label: "IndexedDB",
		family: "economy",
		rarity: "uncommon",
		description: "+8KB storage per correct answer.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		storagePerCorrect: 8,
	},
	// Checks — stack a harder gate condition for a bigger payout (harder = richer)
	coverageGain: {
		id: "coverage-gain",
		label: "Coverage",
		family: "check",
		rarity: "uncommon",
		description: "Gate also needs +4% coverage — pays 1.5× storage.",
		requirementDelta: 0,
		rewardMultiplier: 1.5,
		check: "coverage-gain",
		checkAmount: 4,
	},
	coldStart: {
		id: "cold-start",
		label: "Cold Start",
		family: "check",
		rarity: "uncommon",
		description:
			"Gate also needs your first 2 answers correct — pays 1.5× storage.",
		requirementDelta: 0,
		rewardMultiplier: 1.5,
		check: "cold-start",
		checkAmount: 2,
	},
	speed: {
		id: "speed",
		label: "Speed",
		family: "check",
		rarity: "uncommon",
		description: "Gate also needs 2 fast answers — pays 2× storage.",
		requirementDelta: 0,
		rewardMultiplier: 2,
		check: "speed",
		checkAmount: 2,
	},
	mirrored: {
		id: "mirrored",
		label: "Mirrored",
		family: "check",
		rarity: "rare",
		description:
			"Inverted — gate also needs 2 WRONG answers — pays 2× storage.",
		requirementDelta: 0,
		rewardMultiplier: 2,
		check: "mirrored",
		checkAmount: 2,
	},
	// Risk — the gambler
	pushForce: {
		id: "push-force",
		label: "push --force",
		family: "risk",
		rarity: "uncommon",
		description: "Gate needs 1 more correct — but pays 2× storage.",
		requirementDelta: 1,
		rewardMultiplier: 2,
	},
	deployFriday: {
		id: "deploy-friday",
		label: "Deploy on Friday",
		family: "risk",
		rarity: "legendary",
		description: "Gate needs 2 more correct — but pays 3× storage.",
		requirementDelta: 2,
		rewardMultiplier: 3,
	},
} as const satisfies Record<string, Tag>;

export const rarityOf = (tag: Tag): Rarity => tag.rarity ?? "common";

/** Base slots per pipeline (the scarcity that makes every tag a real choice). */
export const SLICE_SLOT_CAPACITY = 3;
/** The single pipeline can grow to this many slots across a run. */
export const MAX_SLOTS_PER_PIPELINE = 5;

/**
 * The one board you stack configs on. Its gate always has a baseline correct-answers
 * check; check-configs and Focus configs add more conditions (see CheckKind).
 */
export type Pipeline = {
	readonly id: string;
	/** Current slot capacity (grows on gate rewards). */
	readonly slots: number;
	/** Equipped configs, up to `slots`. */
	readonly tags: readonly Tag[];
};

const sumDelta = (
	tags: readonly Tag[],
	keep: (delta: number) => boolean
): number =>
	tags
		.filter((tag) => keep(tag.requirementDelta))
		.reduce((total, tag) => total + tag.requirementDelta, 0);

/**
 * A pipeline's threshold after tags. Risk raises it; yarn.lock cancels all raises.
 * `base` is the kind's escalated base (correct-count, coverage %, fast-count, wrong-count).
 * Floored at 1 so a gate can never be free.
 */
export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	const raises = pipeline.tags.some((tag) => tag.immuneToRaise)
		? 0
		: sumDelta(pipeline.tags, (d) => d > 0);
	const lowers = sumDelta(pipeline.tags, (d) => d < 0);
	return Math.max(1, base + raises + lowers);
};

/** A pipeline's combined Risk payout multiplier, applied only on a pass. */
export const rewardMultiplierFor = (pipeline: Pipeline): number =>
	pipeline.tags.reduce((product, tag) => product * tag.rewardMultiplier, 1);

export const isBare = (pipeline: Pipeline): boolean =>
	pipeline.tags.length === 0;

/** Player-chosen strip: peel one named tag off a pipeline on a gate failure. */
export const stripSticker = (pipeline: Pipeline, tagId: string): Pipeline => {
	if (!pipeline.tags.some((tag) => tag.id === tagId))
		throw new Error(
			`Tag "${tagId}" is not equipped on pipeline "${pipeline.id}"`
		);
	return { ...pipeline, tags: pipeline.tags.filter((tag) => tag.id !== tagId) };
};

/** A Focus config's in-category coverage multiplier at a given level: L1 = 1.5×, L2 = 2×, … */
export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.5 * level;

/**
 * Coverage on a correct answer, driven by ALL equipped tags across every pipeline
 * (your whole build): Focus (1.5× in-category) × Amplify multipliers + flat adds.
 */
export const coverageForAnswer = (
	tags: readonly Tag[],
	categoryCode: CategoryCode,
	correct: boolean
): number => {
	if (!correct) return 0;
	const focusTag = tags.find((tag) => tag.focusCategory === categoryCode);
	const focus = focusTag ? focusCoverageMultiplier(focusTag.level ?? 1) : 1;
	const multiplier = tags.reduce(
		(product, tag) => product * (tag.coverageMultiplier ?? 1),
		1
	);
	const added = tags.reduce((sum, tag) => sum + (tag.coverageAdd ?? 0), 0);
	return Math.round((focus * multiplier + added) * 10) / 10;
};
