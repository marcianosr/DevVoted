import { Config } from "~/domains/configs/models/config";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { Run } from "~/domains/runs/models/run";
import { STORAGE_UNITS } from "~/lib/storage";

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
];

export type ScoreMods = {
	ampAdd?: number; // +0.5, -0.2
	ampMul?: number; // x1.2
	xpAdd?: number; // flat XP (post-amp by default)
};

type EffectCtx = PollWithOptionsResponse & {
	run: Run;
};

export type EffectRenderProps = {
	disabledOptionIds?: number[];
	amp?: number;
};

type EffectMeta = { notes?: string[]; badges?: Record<string, string> };
export type EffectOut = {
	view: EffectCtx;
	renderProps?: EffectRenderProps; // UI-only knobs (disable options, show amp badge, etc.)
	score?: ScoreMods;
	meta?: EffectMeta;
};

type EffectFn = (ctx: EffectCtx, config: Config) => EffectOut;

type ApplyEffects = {
	view: EffectCtx;
	renderProps: EffectRenderProps;
	score: ScoreMods;
	meta: EffectMeta;
};

// Registry
const EFFECTS: Record<string, EffectFn> = {
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
	randomStreakAmp: ({ poll, options, run, hasAnswered }) => {
		// TODO: Don't forget to handle negative amp.
		// If the base amp is 0 or lower it should be clamped to 0
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
};

export function applyEffects(
	base: EffectCtx,
	activeConfigIds: string[] = []
): ApplyEffects {
	if (!activeConfigIds.length)
		return { view: base, renderProps: {}, score: {}, meta: {} };

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
				},
				score: {
					ampAdd: (acc.score.ampAdd ?? 0) + (out.score?.ampAdd ?? 0),
					ampMul: (acc.score.ampMul ?? 1) * (out.score?.ampMul ?? 1),
					xpAdd: (acc.score.xpAdd ?? 0) + (out.score?.xpAdd ?? 0),
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
		{ view: base, renderProps: {}, meta: {}, score: {} }
	);
}
