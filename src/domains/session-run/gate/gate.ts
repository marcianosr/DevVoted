import { Pipeline, effectiveRequirement } from "../pipeline/pipeline";
import { focusDemand } from "../configs/config";

export const SLICE_WINDOW = 5;
export const CLIMB_BASE_REQUIREMENT = 1;
export const VICTORY_GATE = 5;

export const escalation = (gatesCleared: number): number =>
	Math.floor(gatesCleared / 2);

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

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

export const currentRequirement = (
	pipeline: Pipeline,
	gatesCleared: number
): number =>
	effectiveRequirement(
		pipeline,
		CLIMB_BASE_REQUIREMENT + escalation(gatesCleared)
	);

export type CheckStatus = {
	readonly label: string;
	readonly progress: string;
	readonly met: boolean;
};

export const checkStatuses = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): readonly CheckStatus[] => {
	const baseline = currentRequirement(pipeline, gatesCleared);
	const statuses: CheckStatus[] = [
		{
			label: "Correct",
			progress: `${window.correct}/${baseline}`,
			met: window.correct >= baseline,
		},
	];

	for (const config of pipeline.configs) {
		if (config.check === "coverage-gain") {
			const threshold = (config.checkAmount ?? 0) + escalation(gatesCleared);
			statuses.push({
				label: "Coverage",
				progress: `${window.coverageGained}%/${threshold}%`,
				met: window.coverageGained >= threshold,
			});
		}
		if (config.check === "cold-start") {
			const amount = config.checkAmount ?? 0;
			statuses.push({
				label: "Cold start",
				progress: `${window.leadingCorrect}/${amount}`,
				met: window.leadingCorrect >= amount,
			});
		}
		if (config.check === "speed") {
			const amount = config.checkAmount ?? 0;
			statuses.push({
				label: "Speed",
				progress: `${window.fast}/${amount} fast`,
				met: window.fast >= amount,
			});
		}
		if (config.focusCategory) {
			const tally = window.byCategory[config.focusCategory] ?? {
				seen: 0,
				correct: 0,
			};
			const need = focusDemand(config);
			statuses.push({
				label: `${config.label} mastery`,
				progress: tally.seen === 0 ? "not seen" : `${tally.correct}/${need}`,
				met: tally.seen === 0 || tally.correct >= need,
			});
		}
	}

	return statuses;
};

export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	checkStatuses(pipeline, window, gatesCleared).every((check) => check.met);

export const gateDemands = (
	pipeline: Pipeline,
	gatesCleared: number
): readonly string[] => {
	const correct = currentRequirement(pipeline, gatesCleared);
	const demands: string[] = [
		`${correct} correct answer${correct === 1 ? "" : "s"}`,
	];
	for (const config of pipeline.configs) {
		if (config.check === "coverage-gain")
			demands.push(
				`+${(config.checkAmount ?? 0) + escalation(gatesCleared)}% coverage this window`
			);
		if (config.check === "cold-start")
			demands.push(`your first ${config.checkAmount ?? 0} answers correct`);
		if (config.check === "speed")
			demands.push(`${config.checkAmount ?? 0} fast answers`);
		if (config.focusCategory)
			demands.push(
				`${config.label}: get one right if ${config.focusCategory} appears`
			);
	}
	return demands;
};
