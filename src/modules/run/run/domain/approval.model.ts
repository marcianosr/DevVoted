import { crowdSubmitterFor } from "~/modules/run/build/domain/build.model";
import { mirrorsPolls } from "~/modules/run/gate/domain/audit.model";
import { gateSliceOf } from "~/modules/run/run/domain/rebase.model";
import {
	auditsOf,
	isPrepPhase,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";

export const APPROVALS_NEEDED = 2;

export type ApprovalRefusal = "offline" | "mirrored";

export type ApprovalSlotView = {
	readonly pollId: string;
	readonly category: CategoryCode;
	readonly ready: boolean;
};

export type ApprovalBoard = {
	readonly slots: readonly ApprovalSlotView[];
	readonly refusal: ApprovalRefusal | null;
};

export const approvalRefusalOf = (
	state: RunState
): ApprovalRefusal | undefined => {
	if (crowdSubmitterFor(state.build.configs) === undefined) return "offline";
	if (mirrorsPolls(auditsOf(state))) return "mirrored";
	return undefined;
};

export const canApprove = (state: RunState): boolean =>
	isPrepPhase(state) && approvalRefusalOf(state) === undefined;

const standsInThisGate = (state: RunState, pollId: string): boolean =>
	gateSliceOf(state).some((poll) => poll.id === pollId);

export const approve = (state: RunState, pollId: string): RunState => {
	if (!canApprove(state)) return state;
	if (!standsInThisGate(state, pollId)) return state;
	return { ...state, approvedPollId: pollId };
};

export const approvedPollOf = (state: RunState): RunPoll | undefined => {
	const current = state.polls[state.currentIndex];
	if (current === undefined) return undefined;
	return current.id === state.approvedPollId ? current : undefined;
};
