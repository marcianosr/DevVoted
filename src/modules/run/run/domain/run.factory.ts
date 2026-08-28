import type { CategoryCode } from "~/shared/lib/categories";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	BASE_SPOTS,
	occupiedSpots,
} from "~/modules/run/pipeline/domain/pipeline.model";
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

export const atGateWithBuild = (
	gate: number,
	configCount: number
): RunState => {
	const base = started(["js"]);
	const roster = Object.values(CONFIGS).slice(0, configCount);
	return {
		...base,
		gatesCleared: gate,
		pipeline: {
			...base.pipeline,
			spots: occupiedSpots(roster),
			configs: roster,
		},
	};
};

export const failGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, false);
	return next;
};

export const payPeel = (state: RunState): RunState => {
	let next = state;
	while (next.peelSpotsRemaining > 0 && next.pipeline.configs.length > 0)
		next = runReducer(next, {
			type: "strip",
			configId: next.pipeline.configs[0].id,
		});
	return runReducer(next, { type: "resume-climb" });
};

export const FILLER_IDS = ["ts", "css", "js", "eslint"];

export const started = (slotIds: string[], size = 60): RunState => {
	let state = createRun(pool(size), handed);
	const fillers = FILLER_IDS.filter((id) => !slotIds.includes(id));
	for (const configId of [...slotIds, ...fillers].slice(0, BASE_SPOTS))
		state = runReducer(state, { type: "slot", configId });
	return runReducer(state, { type: "start" });
};
