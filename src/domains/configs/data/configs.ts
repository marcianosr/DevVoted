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

	// TODO: need streak amp mechamic for this
	// {
	// 	id: "math-random-config",
	// 	name: "Math Random",
	// 	image: "/configs/math-random.png",
	// 	cost: STORAGE_UNITS.MB / 2, // 256KB
	// 	level: 1,
	// 	description: "Random amp value every poll",
	// 	rarity: "rare",
	// 	effect: ["freeReroll"],
	// },
];

// Effect context extends the poll response with run data
type EffectCtx = PollWithOptionsResponse & {
	run: Run;
};

export type EffectRenderProps = {
	disabledOptionIds?: number[];
	freeReroll?: boolean;
	multipliers?: Record<number, number>;
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
					...out.renderProps,
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
