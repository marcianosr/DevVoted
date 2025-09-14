import { Config } from "~/domains/configs/models/config";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { Run } from "~/domains/runs/models/run";
import { STORAGE_UNITS } from "~/lib/storage";

// These are configs used in the real game
export const configs: Config[] = [
	{
		id: "eslint-config",
		name: "ESLint Config",
		image: "/configs/eslint.png",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		level: 3,
		description: "Disables 1 wrong option",
		rarity: "uncommon",
		effect: ["disableWrongOptions"],
	},
	{
		id: ".html",
		name: ".html",
		image: "/configs/html",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: ".css",
		name: ".css",
		image: "/configs/css",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category CSS polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: ".js",
		name: ".js",
		image: "/configs/js",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category JavaScript polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: ".ts",
		name: ".ts",
		image: "/configs/ts",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category TypeScript polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: ".jsx",
		name: ".jsx",
		image: "/configs/jsx",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category React polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: ".git",
		name: ".git",
		image: "/configs/git",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	{
		id: "package.json",
		name: "package.json",
		image: "/configs/package-json.png",
		cost: STORAGE_UNITS.MB / 2, // 1MB
		description: "+0.5 amp on category General Frontend polls",
		rarity: "common",
		effect: ["streakAmp"],
	},
	// {
	// 	id: "math-random-config",
	// 	name: "Math Random",
	// 	image: "/configs/math-random.png",
	// 	cost: STORAGE_UNITS.MB / 2, // 256KB
	// 	level: 1,
	// 	description: "Random amp value between -0.5 and +0.5 every poll",
	// 	rarity: "rare",
	// 	effect: ["randomStreakAmp"],
	// },
];

// Effect context extends the poll response with run data
type EffectCtx = PollWithOptionsResponse & {
	run: Run;
};

export type EffectRenderProps = {
	disabledOptionIds?: number[];
	amp?: number;
};

type EffectMeta = { notes?: string[]; badges?: Record<string, string> };
type EffectOut = {
	view: EffectCtx;
	renderProps?: EffectRenderProps;
	meta?: EffectMeta;
};
type EffectFn = (ctx: EffectCtx) => EffectOut;

// Registry
const EFFECTS: Record<string, EffectFn> = {
	disableWrongOptions: ({ poll, options, run, hasAnswered }) => {
		const disabledIds = options.filter((o) => !o.correct).map((o) => o.id);
		const randomIdFromDisabled =
			disabledIds[Math.floor(Math.random() * disabledIds.length)];

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { disabledOptionIds: [randomIdFromDisabled] },
			meta: { notes: ["Hid wrong options"] },
		};
	},
	streakAmp: ({ poll, options, run, hasAnswered }) => {
		const additionalAmp = 0.5; // Just the bonus to add

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { amp: additionalAmp }, // Simple number now
			meta: {
				notes: [`+${additionalAmp} amp for ${poll.categoryCode} polls`],
			},
		};
	},
	randomStreakAmp: ({ poll, options, run, hasAnswered }) => {
		// TODO: Don't forget to handle negative amp.
		// If the base amp is 0 or lower it should be clamped to 0
		const rawValue = Math.random() - 0.5;
		const additionalAmp = Math.round(rawValue * 10) / 10;

		return {
			view: { poll, options, run, hasAnswered },
			renderProps: { amp: additionalAmp },
			meta: {
				notes: [`Random amp for ${poll.categoryCode} polls`],
			},
		};
	},
};

export function applyEffects(base: EffectCtx, activeConfigIds: string[] = []) {
	if (!activeConfigIds?.length)
		return { view: base, renderProps: {}, meta: {} };

	const effectIds = activeConfigIds.flatMap(
		(id) => configs.find((c) => c.id === id)?.effect ?? []
	);

	return effectIds.reduce<{
		view: EffectCtx;
		renderProps: EffectRenderProps;
		meta: EffectMeta;
	}>(
		(acc, id) => {
			const fn = EFFECTS[id];
			if (!fn) return acc;
			const out = fn(acc.view);
			return {
				view: out.view,
				renderProps: {
					...acc.renderProps,
					// Amp values are additive
					amp:
						(acc.renderProps.amp ?? 0) +
						(out.renderProps?.amp ?? 0),
					disabledOptionIds: [
						...(acc.renderProps.disabledOptionIds ?? []),
						...(out.renderProps?.disabledOptionIds ?? []),
					],
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
		{ view: base, renderProps: {}, meta: {} }
	);
}
