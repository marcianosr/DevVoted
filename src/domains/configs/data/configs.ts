import { Config } from "~/domains/configs/models/config";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { Run } from "~/domains/runs/models/run";
import { calculateThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";
import { STORAGE_UNITS, formatStorage } from "~/lib/storage";

export const configs: Config[] = [
	{
		id: ".html-config",
		name: ".html",
		image: "/configs/html",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category HTML polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["html"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: ".css-config",
		name: ".css",
		image: "/configs/css",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category CSS polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["css"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: ".js-config",
		name: ".js",
		image: "/configs/js",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category JavaScript polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["js"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: ".ts-config",
		name: ".ts",
		image: "/configs/ts",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category TypeScript polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["ts"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: ".jsx-config",
		name: ".jsx",
		image: "/configs/jsx",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category React polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["react"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: ".git-config",
		name: ".git",
		image: "/configs/git",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category Git polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["git"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: "package.json-config",
		name: "package.json",
		image: "/configs/package-json.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "+2% coverage on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["general-frontend"],
		priority: 100,
		coverageBonus: 2,
	},
	{
		id: "local-storage-config",
		name: "Local Storage",
		image: "/configs/local-storage.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "When held, grants 512KB of extra storage",
		rarity: "common",
		effect: ["expandStorage"],
		priority: 100,
		storageBonus: STORAGE_UNITS.KB * 256, // 256KB bonus storage
	},
	{
		id: "eslint-config",
		name: "ESLint Config",
		image: "/configs/eslint.png",
		cost: STORAGE_UNITS.MB / 2,
		description:
			"Disables 1 wrong option when answering JavaScript/TypeScript polls",
		rarity: "uncommon",
		effect: ["disableWrongOptions"],
		priority: 100,
	},
	{
		id: "code-coverage-config",
		name: "Code Coverage Config",
		image: "/configs/code-coverage.png",
		cost: STORAGE_UNITS.MB / 4,
		description: "+0.5% coverage polls for every poll answered",
		rarity: "common",
		effect: ["streakAmp"],
		priority: 100,
		coverageBonus: 0.5,
		targetCategories: [],
	},
	// TODO: re-enable try/catch config when refactored
	{
		id: "try-catch-config",
		name: "Try/Catch",
		image: "/configs/try-catch.png",
		cost: STORAGE_UNITS.MB / 2,
		description:
			"Saves your run when you have at least 80% of the coverage threshold. When activated, this config is consumed.",
		rarity: "rare",
		effect: ["checkCoverageWithThreshold"],
		priority: 100,
	},
	{
		id: "math-random-config",
		name: "Math Random",
		image: "/configs/math-random.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Random code coverage value between -5 and +5 every poll",
		rarity: "rare",
		effect: ["randomStreakAmp"],
		priority: 100,
	},
	// TODO: re-enable deflate config when we can make it work
	// {
	// 	id: "deflate-config",
	// 	name: "Deflate",
	// 	image: "/configs/deflate-config.png",
	// 	cost: STORAGE_UNITS.MB / 2,
	// 	description: "Reduces the cost of all configs by 10%",
	// 	rarity: "uncommon",
	// 	effect: ["reduceConfigCost"],
	// 	priority: 50, // Run before other effects
	// 	reductionCost: 0.1, // 10% cost reduction
	// },
	{
		id: "hot-reload-config",
		name: "Hot Reload",
		image: "/configs/hot-reload-config.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Allow rebuilds to reset after every poll",
		rarity: "rare",
		effect: ["resetRebuild"],
		priority: 50,
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
	bonus?: number; // flat storage bonus (applied to storage capacity)
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
	// Disables one random wrong option (ESLint Config effect)
	disableWrongOptions: ({ poll, options, run, hasAnswered }, _config) => {
		if (poll.categoryCode === "js" || poll.categoryCode === "ts") {
			const disabledIds = options.filter((o) => !o.correct).map((o) => o.id);
			const randomIdFromDisabled =
				disabledIds[Math.floor(Math.random() * disabledIds.length)];

			return {
				view: { poll, options, run, hasAnswered },
				renderProps: { disabledOptionIds: [randomIdFromDisabled] },
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
	expandStorage: ({ poll, options, run, hasAnswered }, config) => {
		// Use storageBonus from config if provided, otherwise default to 512KB
		const bonusStorage = config.storageBonus ?? STORAGE_UNITS.KB * 512;

		return {
			view: { poll, options, run, hasAnswered },
			storage: { bonus: bonusStorage },
			meta: {
				notes: [`+${formatStorage(bonusStorage)} storage capacity`],
			},
		};
	},

	checkCoverageWithThreshold: ({ poll, options, run, hasAnswered }) => {
		// Calculate total polls answered from category coverage (fallback for compatibility)
		const totalPollsAnswered = run.categoryCoverage.reduce(
			(sum, coverage) => sum + coverage.pollsAnswered,
			0
		);

		// Calculate threshold based on category coverage data and answered polls
		// Note: This uses answered polls as a proxy for seen polls since we don't have access to totalPollsSeen here
		const thresholdInfo = calculateThresholdInfo(
			run.categoryCoverage,
			totalPollsAnswered
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
		};

	const effects = activeConfigIds
		.map((id) => configs.find((c) => c?.id === id))
		.filter((c): c is Config => !!c)
		.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
		.flatMap((config) =>
			config.effect.map((effectId) => ({ config, effectId }))
		);

	return effects.reduce<ApplyEffects>(
		(acc, { config, effectId }) => {
			const fn = EFFECTS[effectId];
			if (!fn) return acc;
			const out = fn(acc.view, config);

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
					bonus: (acc.storage.bonus ?? 0) + (out.storage?.bonus ?? 0),
				},
				protection: {
					// If any config provides try/catch protection, it's active
					tryCatch:
						acc.protection.tryCatch || out.protection?.tryCatch || false,
				},
				reductionCost: (acc.reductionCost ?? 0) + (out.reductionCost ?? 0),
				resetRebuild: acc.resetRebuild || out.resetRebuild || false,
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
		}
	);
}
