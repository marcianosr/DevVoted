import type { CategoryCode } from "~/shared/lib/categories";

import type { Config } from "~/modules/run/config/domain/config.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";

export type PollSlot = {
	readonly id: string;
	readonly category: CategoryCode;
};

export const rebaserFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.reordersGatePolls === true);

/**
 * Prep is two statuses, not one: `configuring` at the run's start and
 * `rewarding` for every shop-then-prep hub after it (ADR-032). Both stand in
 * front of a gate that has not begun, which is the whole condition — once an
 * answer lands the order is the player's committed bet.
 */
export const canRebase = (state: Pick<RunState, "status">): boolean =>
	state.status === "configuring" || state.status === "rewarding";

/**
 * The gate's polls, never the day's. `polls` runs long in the pool-fed
 * prototype, so the end is clamped, and the start is the cursor rather than 0
 * so an answered poll can never be dragged back into play.
 */
export const gateSliceOf = (
	state: Pick<RunState, "polls" | "currentIndex">
): readonly RunPoll[] =>
	state.polls.slice(state.currentIndex, state.currentIndex + SLICE_WINDOW);

export const upcomingSlotsOf = (
	state: Pick<RunState, "polls" | "currentIndex" | "build" | "status">
): readonly PollSlot[] =>
	!canRebase(state) || rebaserFor(state.build.configs) === undefined
		? []
		: gateSliceOf(state).map((poll) => ({
				id: poll.id,
				category: poll.category,
			}));

/**
 * Moves one poll within the gate slice. `from` and `to` are offsets into that
 * slice, not into `polls` — the client never learns the engine's cursor, and
 * the validator can bound them against SLICE_WINDOW alone.
 *
 * Splice-move rather than swap: the player is arranging a ramp, so everything
 * the moved poll passes shifts one place and keeps its relative order. A swap
 * would scramble two positions the player had already placed.
 */
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
		polls: [
			...state.polls.slice(0, state.currentIndex),
			...moved,
			...state.polls.slice(state.currentIndex + slice.length),
		],
	};
};

const isWithin = (slice: readonly RunPoll[], index: number): boolean =>
	Number.isInteger(index) && index >= 0 && index < slice.length;
