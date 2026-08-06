import {
	checkState,
	CheckStatus,
	EffectContext,
	effectOf,
	GateWindow,
} from "../configs/effect.model";
import {
	Pipeline,
	effectiveRequirement,
	isBare,
} from "../pipeline/pipeline.model";
import { ESCALATION_CAP, SLICE_WINDOW, escalation } from "../rules.model";

const passes = (state: CheckStatus["state"]): boolean =>
	state === "success" || state === "skipped";

const correctDemand = (required: number): string =>
	`${required} correct answer${required === 1 ? "" : "s"}`;

const correctConfigOf = (pipeline: Pipeline) =>
	pipeline.configs.find((config) => config.check === "correct");

/**
 * The correct-answer demand, or null when no installed config carries one.
 * Checks come only from configs (ADR-017): a build without Unit Tests owes
 * no correct count — farming is priced out by the correctness-scaled gate
 * payout instead. Each Unit Tests level adds +1; auto-escalation adds up to
 * +ESCALATION_CAP (an L1 build never owes more than 4 of 5, whatever the
 * depth); the total clamps to the window, so only bought levels can demand
 * a perfect 5/5.
 */
export const currentRequirement = (
	pipeline: Pipeline,
	gatesCleared: number
): number | null => {
	const correctConfig = correctConfigOf(pipeline);
	if (!correctConfig) return null;
	const base = correctConfig.checkAmount ?? 1;
	const level = correctConfig.level ?? 1;
	const demanded = Math.min(
		SLICE_WINDOW,
		base + (level - 1) + Math.min(escalation(gatesCleared), ESCALATION_CAP)
	);
	return effectiveRequirement(pipeline, demanded);
};

export const checkStatuses = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): readonly CheckStatus[] => {
	const requirement = currentRequirement(pipeline, gatesCleared);
	const context: EffectContext = { window, gatesCleared };
	const contributed = pipeline.configs.flatMap((config) => {
		const effect = effectOf(config);
		return effect.gateCheck
			? [
					{
						...effect.gateCheck(context),
						sourceConfigId: config.id,
						description: effect.demand?.(gatesCleared),
					},
				]
			: [];
	});
	if (requirement === null) return contributed;
	return [
		{
			label: "Correct",
			progress: `${window.correct}/${requirement}`,
			current: window.correct,
			target: requirement,
			state: checkState(window.correct >= requirement, window),
			description: correctDemand(requirement),
			sourceConfigId: correctConfigOf(pipeline)?.id,
		},
		...contributed,
	];
};

/**
 * A bare pipeline never clears: with checks coming only from configs
 * (ADR-017), an empty checklist would pass vacuously and make a stripped-
 * bare run immortal. Nothing installed means nothing ships — so bareness
 * itself is the failure, keeping "a bare build fails → dead" reachable.
 */
export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	!isBare(pipeline) &&
	checkStatuses(pipeline, window, gatesCleared).every((check) =>
		passes(check.state)
	);

export const gateDemands = (
	pipeline: Pipeline,
	gatesCleared: number
): readonly string[] => {
	const correct = currentRequirement(pipeline, gatesCleared);
	const contributed = pipeline.configs.flatMap((config) => {
		const demand = effectOf(config).demand;
		return demand ? [demand(gatesCleared)] : [];
	});
	if (correct === null) return contributed;
	return [correctDemand(correct), ...contributed];
};
