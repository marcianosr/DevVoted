import type { CategoryCode } from "~/domains/shared/categories";

import { escalation } from "../rules";
import { Config, focusCoverageMultiplier } from "./config";

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

export type CheckStatus = {
	readonly label: string;
	readonly progress: string;
	readonly met: boolean;
};

export type Coverage = { readonly mult: number; readonly add: number };

export type EffectContext = {
	readonly window: GateWindow;
	readonly gatesCleared: number;
};

/**
 * A config's behaviour as a set of phase hooks. Only the hooks it participates in are set.
 * The engine folds these generically (see pipeline/ and gate/), so a config never needs a
 * bespoke function like the old `hasLinter`, and a new effect only touches `effectOf`.
 */
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
			return {
				label: `${config.label} mastery`,
				progress: tally.seen === 0 ? "not seen" : `${tally.correct}/${level}`,
				met: tally.seen === 0 || tally.correct >= level,
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
					met: window.coverageGained >= threshold,
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
				met: window.leadingCorrect >= amount,
			}),
			demand: () => `your first ${amount} answers correct`,
		};
	return {
		gateCheck: ({ window }) => ({
			label: "Speed",
			progress: `${window.fast}/${amount} fast`,
			met: window.fast >= amount,
		}),
		demand: () => `${amount} fast answers`,
	};
};

/** The single place a config's data becomes behaviour. Add a new effect here and nowhere else. */
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
