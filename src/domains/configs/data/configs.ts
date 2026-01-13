import { Config } from "~/domains/configs/models/config";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { getChallengeModeOrDefault } from "~/domains/runs/data/challengeModes";
import { Run } from "~/domains/runs/models/run";
import { calculateThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";
import { selectSeededRandom } from "~/lib/seededRandom";
import { STORAGE_UNITS, formatStorage } from "~/lib/storage";

export const configs: Config[] = [
	{
		id: ".html-config",
		name: ".html",
		image: "/configs/html",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on HTML polls. Slightly boosts the probability of HTML polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["html"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".css-config",
		name: ".css",
		image: "/configs/css",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category CSS polls. Slightly boosts the probability of CSS polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["css"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".js-config",
		name: ".js",
		image: "/configs/js",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category JavaScript polls. Slightly boosts the probability of JavaScript polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["js"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".ts-config",
		name: ".ts",
		image: "/configs/ts",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category TypeScript polls. Slightly boosts the probability of TypeScript polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["ts"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".jsx-config",
		name: ".jsx",
		image: "/configs/jsx",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category React polls. Slightly boosts the probability of React polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["react"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".git-config",
		name: ".git",
		image: "/configs/git",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category Git polls. Slightly boosts the probability of Git polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["git"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: "package.json-config",
		name: "package.json",
		image: "/configs/package-json.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category General Frontend polls. Slightly boosts the probability of General Frontend polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["general-frontend"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".java-config",
		name: ".java",
		image: "/configs/java.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category Java polls. Slightly boosts the probability of Java polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["java"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: ".py-config",
		name: ".py",
		image: "/configs/py.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on category Python polls. Slightly boosts the probability of Python polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["python"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: "local-storage-config",
		name: "Local Storage",
		image: "/configs/local-storage.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "When held, grants 512KB of extra storage.",
		rarity: "common",
		effect: ["expandStorage"],
		priority: 100,
		storageBonus: STORAGE_UNITS.KB * 256, // 256KB bonus storage
	},
	{
		id: "eslint-config",
		name: "ESLint",
		image: "/configs/eslint.png",
		cost: STORAGE_UNITS.MB / 2,
		description:
			"Disables 1 wrong option when answering JavaScript/TypeScript polls.",
		rarity: "uncommon",
		effect: ["disableWrongOptions"],
		priority: 100,
	},
	{
		id: "stylelint-config",
		name: "Stylelint",
		image: "/configs/stylelint.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Disables 1 wrong option when answering HTML/CSS polls.",
		rarity: "uncommon",
		effect: ["disableWrongOptions"],
		priority: 100,
	},
	{
		id: "code-coverage-config",
		name: "Code Coverage",
		image: "/configs/code-coverage.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "+0.5% coverage polls for every poll answered.",
		rarity: "common",
		effect: ["streakAmp"],
		priority: 100,
		coverageBonus: 0.5,
		targetCategories: [],
	},
	{
		id: "try-catch-config",
		name: "Try/Catch",
		image: "/configs/try-catch.png",
		cost: (STORAGE_UNITS.MB / 2) * 1.5,
		description:
			"Saves your run when you have at least 80% of the coverage threshold.",
		rarity: "rare",
		effect: ["checkCoverageWithThreshold"],
		priority: 100,
	},
	{
		id: "math-random-config",
		name: "Math Random",
		image: "/configs/math-random.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Random code coverage value between -5 and +5 every poll.",
		rarity: "rare",
		effect: ["randomStreakAmp"],
		priority: 100,
	},
	// TODO: still broken
	// {
	// 	id: "deflate-config",
	// 	name: "Deflate",
	// 	image: "/configs/deflate-config.png",
	// 	cost: STORAGE_UNITS.MB / 2,
	// 	description: "Reduces the cost of all configs by 10%",
	// 	rarity: "uncommon",
	// 	effect: ["reduceConfigCost"],
	// 	priority: 50,
	// 	reductionCost: 0.1,
	// },
	{
		id: "hot-reload-config",
		name: "Hot Reload",
		image: "/configs/hot-reload-config.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Allow rebuilds to reset after every poll.",
		rarity: "rare",
		effect: ["resetRebuild"],
		priority: 50,
	},
	{
		id: "grid-template-areas-config",
		name: "Grid Template Areas",
		image: "/configs/grid-template-areas.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Adds another slot in the shop.",
		rarity: "rare",
		effect: ["addSlotToShop"],
		priority: 100,
	},
	{
		id: "yarn.lock-config",
		name: "yarn.lock",
		image: "/configs/yarn-lock.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Shop items stay the same even when the poll changes. Only rerolls change the shop.",
		rarity: "uncommon",
		effect: ["lockShop"],
		priority: 100,
	},
	{
		id: "copilot-config",
		name: "Copilot",
		image: "/configs/copilot.png",
		cost: STORAGE_UNITS.MB,
		description: "×2 coverage score in every category.",
		rarity: "legendary",
		effect: ["streakAmp"],
		priority: 100,
		targetCategories: [],
		coverageBonus: 2,
		multiplier: true,
	},
	{
		id: "intellisense-config",
		name: "Intellisense",
		image: "/configs/intellisense.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "×1.5 coverage score in every category.",
		rarity: "rare",
		effect: ["streakAmp"],
		priority: 100,
		targetCategories: [],
		coverageBonus: 1.5,
		multiplier: true,
	},
	{
		id: "no-deps-config",
		name: "No Deps",
		image: "/configs/no-deps.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "×2 storage when skipping the shop when held",
		rarity: "rare",
		effect: ["bonusShopStorage"],
		priority: 100,
		storageBonus: STORAGE_UNITS.KB * 64, // 64KB bonus storage
	},
	{
		id: "includes-config",
		name: ".includes",
		image: "/configs/includes.png",
		cost: STORAGE_UNITS.MB / 8,
		description:
			"Tells you if you selected at least one correct answer on multiple choice polls",
		rarity: "rare",
		effect: ["showCorrectOnMultipleChoice"],
		priority: 100,
	},
	{
		id: "length-config",
		name: ".length",
		image: "/configs/length.png",
		cost: STORAGE_UNITS.MB / 8,
		description:
			"Shows how many correct answers exist on multiple choice polls",
		rarity: "rare",
		effect: ["showCorrectCount"],
		priority: 100,
	},
	{
		id: "telemetry-config",
		name: "Telemetry",
		image: "/configs/telemetry.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Show an answer chosen by another player (randomly selected). Hover over to see who picked what.",
		rarity: "uncommon",
		effect: ["showWhoPickedWhat"],
		priority: 100,
	},
	{
		id: "indexed-db-config",
		name: "IndexedDB",
		image: "/configs/indexed-db.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+8KB for each correct poll you had and will have this run. Max 320KB.",
		rarity: "uncommon",
		effect: ["dynamicStorageBonus"],
		priority: 100,
		storagePerCorrect: STORAGE_UNITS.KB * 8,
		maxStorageBonus: STORAGE_UNITS.KB * 320,
	},

	// Increased category weight configs
	{
		id: "html-doctype-config",
		name: "<!DOCTYPE html>",
		image: "/configs/html-doctype.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of HTML polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["html"],
	},
	{
		id: "!important-config",
		name: "!important",
		image: "/configs/important.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "Significantly boosts the probability of CSS polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["css"],
	},
	{
		id: "use-strict-config",
		name: '"use strict"',
		image: "/configs/use-strict.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of JavaScript polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["js"],
	},
	{
		id: "git-commit-config",
		name: "Git Commit",
		image: "/configs/git-commit.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "Significantly boosts the probability of Git polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["git"],
	},
	{
		id: "use-react-config",
		name: "useReact()",
		image: "/configs/use-react.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of React polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["react"],
	},
	{
		id: "pick-polls-ts-config",
		name: "Pick<Polls, 'TS'>",
		image: "/configs/pick-polls-ts.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of TypeScript polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["ts"],
	},
	{
		id: "devtools-config",
		name: "Devtools",
		image: "/configs/devtools.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of General Frontend polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["general-frontend"],
	},
	{
		id: "override-config",
		name: "@Override",
		image: "/configs/override.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of Java polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["java"],
	},
	{
		id: "virtual-env-config",
		name: "Virtual Env",
		image: "/configs/virtual-env.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly boosts the probability of Python polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: 1.1,
		targetCategories: ["python"],
	},
	// Decreased category weight configs
	{
		id: "small-config",
		name: "<small>",
		image: "/configs/small.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of HTML polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["html"],
	},
	{
		id: "display-none-config",
		name: "display: none",
		image: "/configs/display-none.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of CSS polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["css"],
	},
	{
		id: "no-script-config",
		name: "<no script>",
		image: "/configs/no-script.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of JavaScript polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["js"],
	},

	{
		id: ".gitignore-config",
		name: ".gitignore",
		image: "/configs/gitignore.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of Git polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["git"],
	},
	{
		id: "fragment-config",
		name: "<></>",
		image: "/configs/fragment.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of React polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["react"],
	},
	{
		id: "ts-ignore-config",
		name: "@ts-ignore",
		image: "/configs/ts-ignore.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of TypeScript polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["ts"],
	},
	{
		id: "about:blank-config",
		name: "about:blank",
		image: "/configs/about-blank.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of General Frontend polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["general-frontend"],
	},
	{
		id: "deprecated-config",
		name: "@Deprecated",
		image: "/configs/deprecated.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of Java polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["java"],
	},
	{
		id: "pass-config",
		name: "Pass",
		image: "/configs/pass.png",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"Significantly decreases the probability of Python polls appearing.",
		rarity: "uncommon",
		effect: [],
		priority: 100,
		categoryWeightBonus: -1.1,
		targetCategories: ["python"],
	},
];

/**
 * Coverage modifiers that configs can apply to influence scoring.
 * Applied in score calculation:
 * 1. Base coverage = 1% per correct answer
 * 2. Apply multiplicative: baseCoverage * coverageMult
 * 3. Apply additive: result + coverageAdd
 *
 */
export type CoverageMods = {
	coverageAdd?: number; // +0.5, -0.2 (additive coverage bonus/penalty in %)
	coverageMult?: number; // x1.5 (multiplicative coverage modifier)
};
export type StorageMods = {
	expand?: number; // Passive storage expansion (affects effective limit while config is held)
	skipBonus?: number; // Skip shop reward (added to DB storage_limit when skipping)
};
type EffectCtx = PollWithOptionsResponse & {
	run: Run;
};

export type EffectRenderProps = {
	disabledOptionIds?: number[];
	coverageBonus?: number; // Coverage bonus for display
	expandStorage?: number;
};

type EffectMeta = { notes?: string[]; badges?: Record<string, string> };
export type Protection = {
	tryCatch?: boolean; // True when try/catch should prevent failure
};
export type EffectOut = {
	view: EffectCtx;
	renderProps?: EffectRenderProps; // UI-only knobs (disable options, show coverage bonus, etc.)
	coverage?: CoverageMods;
	storage?: StorageMods;
	meta?: EffectMeta;
	protection?: Protection; // Safeguards that prevent run failure
	reductionCost?: number;
	resetRebuild?: boolean;
	extraSlot?: boolean;
	countCorrect?: boolean;
	showCorrectCount?: boolean;
	showWhoPickedWhat?: boolean;
	lockShop?: boolean; // Shop items persist across poll changes
};

type EffectFn = (ctx: EffectCtx, config: Config) => EffectOut;

export type ApplyEffects = {
	view: EffectCtx;
	renderProps: EffectRenderProps;
	coverage: CoverageMods;
	storage: StorageMods;
	meta: EffectMeta;
	protection: Protection;
	reductionCost: number;
	resetRebuild: boolean;
	extraSlot: boolean;
	countCorrect: boolean;
	showCorrectCount: boolean;
	showWhoPickedWhat: boolean;
	lockShop: boolean;
};

/**
 * Effect registry mapping effect IDs to their implementation functions.
 * Each effect receives the current context and config, returns modifications.
 *
 * Effects should return:
 * - view: Updated context (usually unchanged)
 * - renderProps: UI hints (amp display, disabled options, etc.)
 * - score: Math modifiers (ampAdd, ampMul, xpAdd)
 * - meta: Notes and badges for display
 */
const EFFECTS: Record<string, EffectFn> = {
	// Disables one wrong option deterministically (ESLint/Stylelint Config effect)
	disableWrongOptions: ({ poll, options, run, hasAnswered }, config) => {
		const shouldDisableTSJS =
			config.id === "eslint-config" &&
			(poll.categoryCode === "js" || poll.categoryCode === "ts");
		const shouldDisableHTMLCSS =
			config.id === "stylelint-config" &&
			(poll.categoryCode === "html" || poll.categoryCode === "css");

		if (shouldDisableHTMLCSS || shouldDisableTSJS) {
			const wrongOptions = options.filter((o) => !o.correct);
			// Use poll ID + config ID as seed for deterministic selection
			const seed = `${poll.id}-${config.id}`;
			const selectedOption = selectSeededRandom(wrongOptions, seed);

			return {
				view: { poll, options, run, hasAnswered },
				renderProps: {
					disabledOptionIds: selectedOption ? [selectedOption.id] : [],
				},
				meta: { notes: ["Hid wrong options"] },
			};
		}

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { disabledOptionIds: [] },
			meta: { notes: ["No wrong options to hide"] },
		};
	},
	// Adds +0.5% coverage bonus for specific categories (file extension configs)
	streakAmp: ({ poll, options, run, hasAnswered }, config) => {
		// Only apply if this config targets the current poll's category
		const shouldApply =
			config.targetCategories?.length === 0 ||
			config.targetCategories?.includes(poll.categoryCode);

		if (!shouldApply) {
			return {
				view: { poll, options, run, hasAnswered },
				coverage: { coverageAdd: 0 },
				meta: { notes: [] },
			};
		}

		if (config.multiplier) {
			return {
				view: { poll, options, run, hasAnswered },
				coverage: { coverageMult: config.coverageBonus },
				meta: {
					notes: [
						`x${config.coverageBonus} coverage for ${poll.categoryCode} polls`,
					],
				},
			};
		}

		const bonusCoverage = config.coverageBonus ?? 0;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { coverageBonus: bonusCoverage },
			coverage: { coverageAdd: bonusCoverage },
			meta: {
				notes: [`+${bonusCoverage} amp for ${poll.categoryCode} polls`],
			},
		};
	},
	// Adds random coverage between -0.5% and +0.5% (Math Random Config effect)
	randomStreakAmp: ({ poll, options, run, hasAnswered }) => {
		const rawValue = Math.random() * 10 - 5;
		const bonusCoverage = Math.round(rawValue * 10) / 10;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { coverageBonus: bonusCoverage },
			coverage: { coverageAdd: bonusCoverage },
			meta: {
				notes: [`Random code coverage bonus for ${poll.categoryCode} polls`],
			},
		};
	},

	// Grants extra storage capacity (Local Storage Config effect)
	// This is a PASSIVE bonus - only affects effective limit while config is held
	expandStorage: ({ poll, options, run, hasAnswered }, config) => {
		const bonusStorage = config.storageBonus ?? STORAGE_UNITS.KB * 512;

		return {
			view: { poll, options, run, hasAnswered },
			storage: { expand: bonusStorage },
			meta: {
				notes: [`+${formatStorage(bonusStorage)} storage capacity`],
			},
		};
	},

	dynamicStorageBonus: ({ poll, options, run, hasAnswered }, config) => {
		const perCorrect = config.storagePerCorrect ?? STORAGE_UNITS.KB * 8;
		const maxBonus = config.maxStorageBonus ?? STORAGE_UNITS.KB * 320;
		const bonusStorage = Math.min(run.correctPollsCount * perCorrect, maxBonus);

		return {
			view: { poll, options, run, hasAnswered },
			storage: { expand: bonusStorage },
			meta: {
				notes: [
					`+${formatStorage(bonusStorage)} storage (${run.correctPollsCount} correct polls)`,
				],
			},
		};
	},

	checkCoverageWithThreshold: ({ poll, options, run, hasAnswered }) => {
		// Calculate total polls answered from category coverage (fallback for compatibility)
		const totalPollsAnswered = run.categoryCoverage.reduce(
			(sum, coverage) => sum + coverage.pollsAnswered,
			0
		);

		// Get gates from challenge mode
		const challengeMode = getChallengeModeOrDefault(run.challengeModeId);

		// Calculate threshold based on category coverage data and answered polls
		// Note: This uses answered polls as a proxy for seen polls since we don't have access to totalPollsSeen here
		const thresholdInfo = calculateThresholdInfo(
			run.categoryCoverage,
			totalPollsAnswered,
			challengeMode.gates
		);
		const requiredCoverage =
			thresholdInfo.gateDefinition?.requirements[0]?.threshold ?? 0;
		const requiredForProtection = requiredCoverage * 0.8; // 80% of threshold

		// Try/Catch only activates when:
		// 1. It's actually a threshold check poll
		// 2. Current max coverage is at least 80% of threshold
		// 3. We would actually fail the threshold
		const isProtected =
			thresholdInfo.isThresholdCheckPoll &&
			thresholdInfo.maxCoverage >= requiredForProtection &&
			!thresholdInfo.meetsThreshold; // Only if we'd actually fail

		// Calculate percentage for display
		const percentageOfThreshold =
			requiredCoverage > 0
				? Math.round((thresholdInfo.maxCoverage / requiredCoverage) * 100)
				: 0;

		// If current coverage is below 80% of threshold, try/catch can't save you
		if (thresholdInfo.maxCoverage < requiredForProtection) {
			return {
				view: { poll, options, run, hasAnswered },
				protection: { tryCatch: false },
				meta: {
					notes: [`Try/Catch inactive (need 80% of threshold)`],
				},
			};
		}

		return {
			view: { poll, options, run, hasAnswered },
			protection: {
				tryCatch: isProtected, // True only when it would actually prevent a failure
			},
			meta: {
				notes: isProtected
					? [
							`Try/Catch will save your run! (have ${percentageOfThreshold}% of threshold)`,
						]
					: [`Try/Catch ready (have ${percentageOfThreshold}% of threshold)`],
				badges: isProtected
					? { "try-catch": "Try/Catch will activate!" }
					: { "try-catch": "Try/Catch ready" },
			},
		};
	},

	reduceConfigCost: ({ poll, options, run, hasAnswered }, config) => {
		const discountPercent = config.reductionCost ?? 0;

		return {
			view: { poll, options, run, hasAnswered },
			reductionCost: discountPercent,
			meta: {
				notes: [`Shop items cost ${discountPercent * 100}% less!`],
			},
		};
	},

	resetRebuild: ({ poll, options, run, hasAnswered }, _config) => {
		return {
			view: { poll, options, run, hasAnswered },
			resetRebuild: true,
			meta: {
				notes: [`Rebuilds will reset after every poll`],
			},
		};
	},
	addSlotToShop: ({ poll, options, run, hasAnswered }, _config) => {
		return {
			view: { poll, options, run, hasAnswered },
			extraSlot: true,
			meta: {
				notes: [`Added an extra slot in the shop`],
			},
		};
	},
	// Locks shop items so they persist across poll changes (yarn.lock effect)
	lockShop: ({ poll, options, run, hasAnswered }, _config) => {
		return {
			view: { poll, options, run, hasAnswered },
			lockShop: true,
			meta: {
				notes: [`Shop items locked until reroll`],
			},
		};
	},
	// Skip shop bonus - only added to DB when skipping, not to effective limit
	bonusShopStorage: ({ poll, options, run, hasAnswered }, config) => {
		const bonusStorage = config.storageBonus ?? 0;

		return {
			view: { poll, options, run, hasAnswered },
			storage: { skipBonus: bonusStorage },
			meta: {
				notes: [`+${formatStorage(bonusStorage)} storage when skipping shop`],
			},
		};
	},
	showCorrectOnMultipleChoice: (
		{ poll, options, run, hasAnswered },
		_config
	) => {
		if (poll.answerType !== "multiple") {
			return {
				countCorrect: false,
				view: { poll, options, run, hasAnswered },
				meta: { notes: ["Not a multiple choice poll"] },
			};
		}

		return {
			countCorrect: options.some((o) => o.correct),
			view: { poll, options, run, hasAnswered },
			meta: { notes: ["Will show correct answers on multiple choice polls"] },
		};
	},

	// Shows how many correct answers exist on multiple choice polls (.length Config effect)
	showCorrectCount: ({ poll, options, run, hasAnswered }, _config) => {
		if (poll.answerType !== "multiple") {
			return {
				showCorrectCount: false,
				view: { poll, options, run, hasAnswered },
				meta: { notes: ["Not a multiple choice poll"] },
			};
		}

		return {
			showCorrectCount: true,
			view: { poll, options, run, hasAnswered },
			meta: {
				notes: ["Will show correct answer count on multiple choice polls"],
			},
		};
	},

	showWhoPickedWhat: ({ poll, options, run, hasAnswered }, _config) => {
		return {
			showWhoPickedWhat: true,
			view: { poll, options, run, hasAnswered },
			meta: { notes: ["Will show answers chosen by others"] },
		};
	},
};

/**
 * Applies config effects to generate UI hints and coverage modifiers.
 *
 * This is the entry point for the config effects system. It:
 * 1. Finds configs by ID and filters out invalid ones
 * 2. Sorts by priority (lower = runs first)
 * 3. Applies each effect function and aggregates results
 * 4. Returns combined UI props, coverage mods, and metadata
 *
 * Used by progress.service.ts to get coverage modifiers before calculation.
 *
 * @param base - The context (poll, options, run, etc.)
 * @param activeConfigIds - Config IDs from run.activeConfigIds
 * @returns Combined effects with UI props and coverage modifiers
 *
 * @example
 * const { coverage, renderProps } = applyEffects(ctx, ['.js-config', 'math-random']);
 * // coverage: { coverageAdd: 0.8 }  (0.5% from .js + 0.3% from random)
 * // renderProps: { coverageBonus: 0.8 }  (UI hint for display)
 */
export function applyEffects(
	base: EffectCtx,
	activeConfigIds: string[] = []
): ApplyEffects {
	if (!activeConfigIds.length)
		return {
			view: base,
			renderProps: {},
			coverage: {},
			meta: {},
			storage: {},
			protection: {},
			reductionCost: 0,
			resetRebuild: false,
			extraSlot: false,
			countCorrect: false,
			showCorrectCount: false,
			showWhoPickedWhat: false,
			lockShop: false,
		};

	const effects = activeConfigIds
		.map((id) => configs.find((c) => c?.id === id))
		.filter((c): c is Config => !!c)
		.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
		.flatMap((config) =>
			config.effect.map((effectId) => ({ config, effectId }))
		);

	const runEffect = (
		fn: EffectFn,
		ctx: EffectCtx,
		config: Config,
		effectId: string
	): EffectOut => {
		try {
			return fn(ctx, config);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new Error(
				`Effect "${effectId}" from config "${config.id}" failed: ${message}`
			);
		}
	};

	return effects.reduce<ApplyEffects>(
		(acc, { config, effectId }) => {
			const fn = EFFECTS[effectId];
			if (!fn) return acc;

			const out = runEffect(fn, acc.view, config, effectId);

			const coverageBonusValue =
				(acc.renderProps.coverageBonus ?? 0) +
				(out.renderProps?.coverageBonus ?? 0);
			const disabledIds = [
				...(acc.renderProps.disabledOptionIds ?? []),
				...(out.renderProps?.disabledOptionIds ?? []),
			];

			return {
				view: out.view,
				renderProps: {
					...acc.renderProps,
					...(coverageBonusValue !== 0 && {
						coverageBonus: coverageBonusValue,
					}),
					...(disabledIds.length > 0 && {
						disabledOptionIds: disabledIds,
					}),
					...(out.renderProps?.expandStorage !== undefined && {
						expandStorage:
							(acc.renderProps.expandStorage ?? 0) +
							out.renderProps.expandStorage,
					}),
				},
				coverage: {
					coverageAdd:
						(acc.coverage.coverageAdd ?? 0) + (out.coverage?.coverageAdd ?? 0),
					coverageMult:
						(acc.coverage.coverageMult ?? 1) *
						(out.coverage?.coverageMult ?? 1),
				},
				storage: {
					expand: (acc.storage.expand ?? 0) + (out.storage?.expand ?? 0),
					skipBonus:
						(acc.storage.skipBonus ?? 0) + (out.storage?.skipBonus ?? 0),
				},
				protection: {
					// If any config provides try/catch protection, it's active
					tryCatch:
						acc.protection.tryCatch || out.protection?.tryCatch || false,
				},
				reductionCost: (acc.reductionCost ?? 0) + (out.reductionCost ?? 0),
				resetRebuild: acc.resetRebuild || out.resetRebuild || false,
				extraSlot: acc.extraSlot || out.extraSlot || false,
				countCorrect:
					(acc.countCorrect ?? false) || (out.countCorrect ?? false),
				showCorrectCount:
					(acc.showCorrectCount ?? false) || (out.showCorrectCount ?? false),
				showWhoPickedWhat:
					(acc.showWhoPickedWhat ?? false) || (out.showWhoPickedWhat ?? false),
				lockShop: acc.lockShop || out.lockShop || false,

				meta: {
					...acc.meta,
					...(out.meta?.badges
						? { badges: { ...acc.meta.badges, ...out.meta.badges } }
						: {}),
					notes: [...(acc.meta.notes ?? []), ...(out.meta?.notes ?? [])],
				},
			};
		},
		{
			view: base,
			renderProps: {},
			meta: {},
			coverage: {},
			storage: {},
			protection: {},
			reductionCost: 0,
			resetRebuild: false,
			extraSlot: false,
			countCorrect: false,
			showCorrectCount: false,
			showWhoPickedWhat: false,
			lockShop: false,
		}
	);
}
