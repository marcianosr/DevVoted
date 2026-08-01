import {
	checkState,
	CheckStatus,
	EffectContext,
	effectOf,
	GateWindow,
} from "../configs/effect.model";
import { Pipeline, effectiveRequirement } from "../pipeline/pipeline.model";
import { CLIMB_BASE_REQUIREMENT, escalation } from "../rules.model";

const passes = (state: CheckStatus["state"]): boolean =>
	state === "success" || state === "skipped";

const correctDemand = (required: number): string =>
	`${required} correct answer${required === 1 ? "" : "s"}`;

export const currentRequirement = (
	pipeline: Pipeline,
	gatesCleared: number
): number => {
	// The correct-requirement config carries the base; only escalation raises it
	// (wiki §4.1: Unit Tests is the only config whose check escalates).
	const correctConfig = pipeline.configs.find(
		(config) => config.check === "correct"
	);
	const base = correctConfig?.checkAmount ?? CLIMB_BASE_REQUIREMENT;
	return effectiveRequirement(pipeline, base + escalation(gatesCleared));
};

export const checkStatuses = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): readonly CheckStatus[] => {
	const baseline = currentRequirement(pipeline, gatesCleared);
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
	const correctConfig = pipeline.configs.find(
		(config) => config.check === "correct"
	);
	return [
		{
			label: "Correct",
			progress: `${window.correct}/${baseline}`,
			current: window.correct,
			target: baseline,
			state: checkState(window.correct >= baseline, window),
			description: correctDemand(baseline),
			sourceConfigId: correctConfig?.id,
		},
		...contributed,
	];
};

export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
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
	return [correctDemand(correct), ...contributed];
};
