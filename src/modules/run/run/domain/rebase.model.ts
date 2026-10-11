import type { CategoryCode } from "~/shared/lib/categories";

import {
	type Config,
	showsAnswerTypes,
} from "~/modules/run/config/domain/config.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import type {
	AnswerType,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

export type PollSlot = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly answerType?: AnswerType;
};

export const rebaserFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.reordersGatePolls === true);

export const canRebase = (state: Pick<RunState, "status">): boolean =>
	state.status === "configuring" || state.status === "rewarding";

export const gateSliceOf = (
	state: Pick<RunState, "polls" | "currentIndex">
): readonly RunPoll[] =>
	state.polls.slice(state.currentIndex, state.currentIndex + SLICE_WINDOW);

export const upcomingSlotsOf = (
	state: Pick<RunState, "polls" | "currentIndex" | "build" | "status">
): readonly PollSlot[] => {
	const rebaser = rebaserFor(state.build.configs);
	if (!canRebase(state) || rebaser === undefined) return [];

	const typed = showsAnswerTypes(rebaser);
	return gateSliceOf(state).map((poll) => ({
		id: poll.id,
		category: poll.category,
		...(typed ? { answerType: poll.answerType } : {}),
	}));
};

export const movedSlice = (
	slice: readonly RunPoll[],
	from: number,
	to: number
): readonly RunPoll[] => {
	const rest = slice.filter((_, index) => index !== from);
	return [...rest.slice(0, to), slice[from], ...rest.slice(to)];
};

export const rebase = (state: RunState, from: number, to: number): RunState => {
	if (!canRebase(state)) return state;
	if (rebaserFor(state.build.configs) === undefined) return state;

	const slice = gateSliceOf(state);
	if (!isWithin(slice, from) || !isWithin(slice, to) || from === to)
		return state;

	const moved = movedSlice(slice, from, to);
	return {
		...state,
		rebasedThisGate: true,
		polls: [
			...state.polls.slice(0, state.currentIndex),
			...moved,
			...state.polls.slice(state.currentIndex + slice.length),
		],
	};
};

const isWithin = (slice: readonly RunPoll[], index: number): boolean =>
	Number.isInteger(index) && index >= 0 && index < slice.length;
