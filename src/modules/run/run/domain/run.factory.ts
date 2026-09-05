import type { CategoryCode } from "~/shared/lib/categories";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { BASE_SLOTS, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";

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
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
	CONFIGS.codeCoverage,
];

export const configIds = (state: RunState): string[] =>
	state.build.configs.map((config) => config.id);

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

export const audited = (
	state: RunState,
	gate: number,
	...ids: AuditId[]
): RunState => ({
	...state,
	gatesCleared: gate,
	auditSchedule: { ...scheduleOf(state), [gate]: ids },
});

export const atGateWithBuild = (
	gate: number,
	configCount: number,
	...ids: AuditId[]
): RunState => {
	const base = started(["js"]);
	const roster = Object.values(CONFIGS).slice(0, configCount);
	return audited(
		{
			...base,
			build: {
				...base.build,
				slots: occupiedSlots(roster),
				configs: roster,
			},
		},
		gate,
		...(ids.length > 0 ? ids : (scheduleOf(base)[gate] ?? []))
	);
};

export const failGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, false);
	return next;
};

export const payPeel = (state: RunState): RunState => {
	let next = state;
	while (next.peelSlotsRemaining > 0 && next.build.configs.length > 0)
		next = runReducer(next, {
			type: "strip",
			configId: next.build.configs[0].id,
		});
	return runReducer(next, { type: "resume-climb" });
};

export const FILLER_IDS = ["ts", "css", "js", "eslint"];

export const started = (slotIds: string[], size = 60): RunState => {
	let state = createRun(pool(size), handed);
	const fillers = FILLER_IDS.filter((id) => !slotIds.includes(id));
	for (const configId of [...slotIds, ...fillers].slice(0, BASE_SLOTS))
		state = runReducer(state, { type: "install", configId });
	return runReducer(state, { type: "start" });
};
