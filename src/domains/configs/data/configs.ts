import { Config } from "~/domains/configs/models/config";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { Run } from "~/domains/runs/models/run";
import { STORAGE_UNITS, formatStorage } from "~/lib/storage";

export const configs: Config[] = [
	{
		id: "eslint-config",
		name: "ESLint Config",
		image: "/configs/eslint.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Disables 1 wrong option",
		rarity: "uncommon",
		effect: ["disableWrongOptions"],
		priority: 100,
	},
	{
		id: ".html-config",
		name: ".html",
		image: "/configs/html",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["html"],
		priority: 100,
	},
	{
		id: ".css-config",
		name: ".css",
		image: "/configs/css",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category CSS polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["css"],
		priority: 100,
	},
	{
		id: ".js-config",
		name: ".js",
		image: "/configs/js",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category JavaScript polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["js"],
		priority: 100,
	},
	{
		id: ".ts-config",
		name: ".ts",
		image: "/configs/ts",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category TypeScript polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["ts"],
		priority: 100,
	},
	{
		id: ".jsx-config",
		name: ".jsx",
		image: "/configs/jsx",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category React polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["react"],
		priority: 100,
	},
	{
		id: ".git-config",
		name: ".git",
		image: "/configs/git",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["git"],
		priority: 100,
	},
	{
		id: "package.json-config",
		name: "package.json",
		image: "/configs/package-json.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["general-frontend"],
		priority: 100,
	},
	{
		id: "math-random-config",
		name: "Math Random",
		image: "/configs/math-random.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "Random amp value between -0.5 and +0.5 every poll",
		rarity: "rare",
		effect: ["randomStreakAmp"],
		priority: 100,
	},
	{
		id: "local-storage-config",
		name: "Local Storage",
		image: "/configs/local-storage.png",
		cost: STORAGE_UNITS.MB / 2,
		description: "When held, grants 512KB of extra storage",
		rarity: "common",
		effect: ["expandStorage"],
		priority: 100,
		storageBonus: STORAGE_UNITS.KB * 512, // 512KB bonus storage
	},
];

/**
 * Score modifiers that configs can apply to influence scoring.
 * Applied in calculatePollScoreForProgression in this order:
 * 1. Base amp = streak bonus (e.g., 1.1x)
 * 2. Apply multiplicative: baseAmp * ampMul
 * 3. Apply additive: result + ampAdd
 * 4. Calculate XP: baseXP * finalAmp + xpAdd
 */
export type ScoreMods = {
	ampAdd?: number; // +0.5, -0.2 (additive amp bonus/penalty)
	ampMul?: number; // x1.2 (multiplicative amp modifier)
	xpAdd?: number; // flat XP bonus (applied after amp calculation)
};
export type StorageMods = {
	bonus?: number; // flat storage bonus (applied to storage capacity)
};
type EffectCtx = PollWithOptionsResponse & {
	run: Run;
};

export type EffectRenderProps = {
	disabledOptionIds?: number[];
	amp?: number;
	expandStorage?: number;
};

type EffectMeta = { notes?: string[]; badges?: Record<string, string> };
export type EffectOut = {
	view: EffectCtx;
	renderProps?: EffectRenderProps; // UI-only knobs (disable options, show amp badge, etc.)
	score?: ScoreMods;
	storage?: StorageMods;
	meta?: EffectMeta;
};

type EffectFn = (ctx: EffectCtx, config: Config) => EffectOut;

type ApplyEffects = {
	view: EffectCtx;
	renderProps: EffectRenderProps;
	score: ScoreMods;
	storage: StorageMods;
	meta: EffectMeta;
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
	disableWrongOptions: ({ poll, options, run, hasAnswered }, config) => {
		const disabledIds = options.filter((o) => !o.correct).map((o) => o.id);
		const randomIdFromDisabled =
			disabledIds[Math.floor(Math.random() * disabledIds.length)];

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { disabledOptionIds: [randomIdFromDisabled] },
			meta: { notes: ["Hid wrong options"] },
		};
	},
	// Adds +0.5 amp bonus for specific categories (file extension configs)
	streakAmp: ({ poll, options, run, hasAnswered }, config) => {
		// Only apply if this config targets the current poll's category
		if (!config.targetCategories?.includes(poll.categoryCode)) {
			return { view: { poll, options, run, hasAnswered } };
		}

		const bonusAmp = 0.5;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { amp: bonusAmp },
			score: { ampAdd: bonusAmp },
			meta: {
				notes: [`+${bonusAmp} amp for ${poll.categoryCode} polls`],
			},
		};
	},
	// Adds random amp between -0.5 and +0.5 (Math Random Config effect)
	randomStreakAmp: ({ poll, options, run, hasAnswered }) => {
		const rawValue = Math.random() - 0.5;
		const bonusAmp = Math.round(rawValue * 10) / 10;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { amp: bonusAmp },
			score: { ampAdd: bonusAmp },
			meta: {
				notes: [`Random amp: ${bonusAmp > 0 ? "+" : ""}${bonusAmp}`],
			},
		};
	},

	// Grants extra storage capacity (Local Storage Config effect)
	// Note: This effect doesn't modify scoring, only storage capacity
	expandStorage: ({ poll, options, run, hasAnswered }, config) => {
		// Use storageBonus from config if provided, otherwise default to 512KB
		const bonusStorage = config.storageBonus ?? STORAGE_UNITS.KB * 512;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: {}, // No UI hints for storage
			score: {}, // No scoring modifications
			storage: { bonus: bonusStorage },
			meta: {
				notes: [`+${formatStorage(bonusStorage)} storage capacity`],
			},
		};
	},
};

/**
 * Applies config effects to generate UI hints and score modifiers.
 *
 * This is the entry point for the config effects system. It:
 * 1. Finds configs by ID and filters out invalid ones
 * 2. Sorts by priority (lower = runs first)
 * 3. Applies each effect function and aggregates results
 * 4. Returns combined UI props, score mods, and metadata
 *
 * Used by progress.service.ts to get score modifiers before calculation.
 *
 * @param base - The context (poll, options, run, etc.)
 * @param activeConfigIds - Config IDs from run.activeConfigIds
 * @returns Combined effects with UI props and score modifiers
 *
 * @example
 * const { score, renderProps } = applyEffects(ctx, ['.js-config', 'math-random']);
 * // score: { ampAdd: 0.8 }  (0.5 from .js + 0.3 from random)
 * // renderProps: { amp: 0.8 }  (UI hint for display)
 */
export function applyEffects(
	base: EffectCtx,
	activeConfigIds: string[] = []
): ApplyEffects {
	if (!activeConfigIds.length)
		return {
			view: base,
			renderProps: {},
			score: {},
			meta: {},
			storage: {},
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

			return {
				view: out.view,
				renderProps: {
					...acc.renderProps,
					amp:
						(acc.renderProps.amp ?? 0) +
						(out.renderProps?.amp ?? 0),
					disabledOptionIds: [
						...(acc.renderProps.disabledOptionIds ?? []),
						...(out.renderProps?.disabledOptionIds ?? []),
					],
					expandStorage:
						(acc.renderProps.expandStorage ?? 0) +
						(out.renderProps?.expandStorage ?? 0),
				},
				score: {
					ampAdd: (acc.score.ampAdd ?? 0) + (out.score?.ampAdd ?? 0),
					ampMul: (acc.score.ampMul ?? 1) * (out.score?.ampMul ?? 1),
					xpAdd: (acc.score.xpAdd ?? 0) + (out.score?.xpAdd ?? 0),
				},
				storage: {
					bonus: (acc.storage.bonus ?? 0) + (out.storage?.bonus ?? 0),
				},
				meta: {
					...acc.meta,
					...(out.meta?.badges
						? { badges: { ...acc.meta.badges, ...out.meta.badges } }
						: {}),
					notes: [
						...(acc.meta.notes ?? []),
						...(out.meta?.notes ?? []),
					],
				},
			};
		},
		{ view: base, renderProps: {}, meta: {}, score: {}, storage: {} }
	);
}
