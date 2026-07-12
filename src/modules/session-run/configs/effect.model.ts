import type { CategoryCode } from "~/domains/shared/categories";

import { escalation, SLICE_WINDOW } from "../rules.model";
import { Config, focusCoverageMultiplier } from "./config.model";

export type CategoryTally = { readonly seen: number; readonly correct: number };

export type GateWindow = {
	readonly correct: number;
	readonly answered: number;
	readonly fast: number;
	readonly coverageGained: number;
	readonly leadingCorrect: number;
	readonly byCategory: Readonly<Record<string, CategoryTally>>;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	fast: 0,
	coverageGained: 0,
	leadingCorrect: 0,
	byCategory: {},
};

export type CheckState = "success" | "running" | "skipped" | "failed";

export type CheckStatus = {
	readonly label: string;
	readonly progress: string;
	readonly state: CheckState;
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

export type EffectContext = {
	readonly window: GateWindow;
	readonly gatesCleared: number;
};

export type Effect = {
	requirementDelta?: number;
	locksBar?: boolean;
	rewardMultiplier?: number;
	faucetPerCorrect?: number;
	coverage?: (category: CategoryCode) => Coverage;
	maskWrongOn?: (category: CategoryCode) => boolean;
	gateCheck?: (ctx: EffectContext) => CheckStatus;
	demand?: (gatesCleared: number) => string;
};

const focusEffect = (config: Config, focusCategory: CategoryCode): Effect => {
	const level = config.level ?? 1;
	return {
		coverage: (category) => ({
			mult: category === focusCategory ? focusCoverageMultiplier(level) : 1,
			add: 0,
		}),
		gateCheck: ({ window }) => {
			const tally = window.byCategory[focusCategory] ?? { seen: 0, correct: 0 };
			const seen = tally.seen > 0;
			return {
				label: `${config.label} mastery`,
				progress: seen ? `${tally.correct}/${level}` : "not seen",
				state: checkState(tally.correct >= level, window, !seen),
			};
		},
		demand: () => `${config.label}: get one right if ${focusCategory} appears`,
	};
};

const checkEffect = (config: Config): Effect => {
	const amount = config.checkAmount ?? 0;
	if (config.check === "coverage-gain")
		return {
			gateCheck: ({ window, gatesCleared }) => {
				const threshold = amount + escalation(gatesCleared);
				return {
					label: "Coverage",
					progress: `${window.coverageGained}%/${threshold}%`,
					state: checkState(window.coverageGained >= threshold, window),
				};
			},
			demand: (gatesCleared) =>
				`+${amount + escalation(gatesCleared)}% coverage this window`,
		};
	if (config.check === "cold-start")
		return {
			gateCheck: ({ window }) => ({
				label: "Cold start",
				progress: `${window.leadingCorrect}/${amount}`,
				state: checkState(window.leadingCorrect >= amount, window),
			}),
			demand: () => `your first ${amount} answers correct`,
		};
	return {
		gateCheck: ({ window }) => ({
			label: "Speed",
			progress: `${window.fast}/${amount} fast`,
			state: checkState(window.fast >= amount, window),
		}),
		demand: () => `${amount} fast answers`,
	};
};

export const effectOf = (config: Config): Effect => {
	if (config.focusCategory) return focusEffect(config, config.focusCategory);
	if (config.check)
		return {
			...checkEffect(config),
			rewardMultiplier: config.rewardMultiplier,
		};
	if (config.eliminatesWrongOptionsFor) {
		const categories = config.eliminatesWrongOptionsFor;
		return { maskWrongOn: (category) => categories.includes(category) };
	}
	if (config.immuneToRaise) return { locksBar: true };
	if (
		config.coverageMultiplier !== undefined ||
		config.coverageAdd !== undefined
	)
		return {
			coverage: () => ({
				mult: config.coverageMultiplier ?? 1,
				add: config.coverageAdd ?? 0,
			}),
		};
	if (config.storagePerCorrect !== undefined)
		return { faucetPerCorrect: config.storagePerCorrect };
	if (config.requirementDelta !== 0)
		return {
			requirementDelta: config.requirementDelta,
			rewardMultiplier: config.rewardMultiplier,
		};
	return {};
};
