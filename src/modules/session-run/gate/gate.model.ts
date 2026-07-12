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

export const currentRequirement = (
	pipeline: Pipeline,
	gatesCleared: number
): number =>
	effectiveRequirement(
		pipeline,
		CLIMB_BASE_REQUIREMENT + escalation(gatesCleared)
	);

export const checkStatuses = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): readonly CheckStatus[] => {
	const baseline = currentRequirement(pipeline, gatesCleared);
	const context: EffectContext = { window, gatesCleared };
	const contributed = pipeline.configs.flatMap((config) => {
		const gateCheck = effectOf(config).gateCheck;
		return gateCheck ? [gateCheck(context)] : [];
	});
	return [
		{
			label: "Correct",
			progress: `${window.correct}/${baseline}`,
			state: checkState(window.correct >= baseline, window),
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
	return [
		`${correct} correct answer${correct === 1 ? "" : "s"}`,
		...contributed,
	];
};
