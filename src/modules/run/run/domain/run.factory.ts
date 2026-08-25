import type { CategoryCode } from "~/shared/lib/categories";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { BASE_SLOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";

export const poll = (
	id: string,
	correct: boolean,
	category: CategoryCode = "react"
): RunPoll => ({
	id,
	category,
	question: `Does ${id} beat Banjo?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct },
		{ id: `${id}-b`, label: "No", correct: !correct },
	],
});

export const pool = (size: number): RunPoll[] =>
	Array.from({ length: size }, (_, index) => poll(`kazooie-${index}`, true));

export const handed = [
	CONFIGS.telemetry,
	CONFIGS.mooresLaw,
	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
	CONFIGS.codeCoverage,
];

export const configIds = (state: RunState): string[] =>
	state.pipeline.configs.map((config) => config.id);

export const answerWith = (state: RunState, correct: boolean): RunState => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return runReducer(state, {
		type: "answer",
		optionIds: [option.id],
	});
};

export const clearGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
	return next;
};

/**
 * A run parked at `gate` holding `configCount` configs. Deep gates peel several
 * configs at once (ADR-037), so the three a start hands out cannot stand in for a
 * summit build; the roster is sliced rather than slotted, since the pipeline's
 * own slot rule is not what these tests are about.
 */
export const atGateWithBuild = (
	gate: number,
	configCount: number
): RunState => {
	const base = started(["js"]);
	const roster = Object.values(CONFIGS).slice(0, configCount);
	return {
		...base,
		gatesCleared: gate,
		pipeline: { ...base.pipeline, slots: configCount, configs: roster },
	};
};

/** A window answered wrong all the way through — the gate's verdict is a miss. */
export const failGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, false);
	return next;
};

/**
 * The peel a missed gate owes, paid off the front of the pipeline, then the
 * resume that reopens the shop (ADR-037) — how a retry actually reaches the
 * polls again.
 */
export const payPeel = (state: RunState): RunState => {
	let next = state;
	while (next.stripsRemaining > 0)
		next = runReducer(next, {
			type: "strip",
			configId: next.pipeline.configs[0].id,
		});
	return runReducer(next, { type: "resume-climb" });
};

// The climb only starts on a full pipeline, so the helper pads the requested
// configs with inert fillers: focus categories the react-only pool never
// serves and a linter that is never used — their checks skip, never judge.
export const FILLER_IDS = ["ts", "css", "js", "eslint"];

export const started = (slotIds: string[], size = 60): RunState => {
	let state = createRun(pool(size), handed);
	const fillers = FILLER_IDS.filter((id) => !slotIds.includes(id));
	for (const configId of [...slotIds, ...fillers].slice(0, BASE_SLOTS))
		state = runReducer(state, { type: "slot", configId });
	return runReducer(state, { type: "start" });
};
