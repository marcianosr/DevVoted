import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { crowdPickFor } from "~/modules/run/community/domain/pollSplit.model";
import {
	fetchApprovalCounts,
	fetchPollSplit,
} from "~/modules/run/community/infrastructure/community.repository";
import {
	APPROVALS_NEEDED,
	type ApprovalBoard,
	approvalRefusalOf,
	approvedPollOf,
} from "~/modules/run/run/domain/approval.model";
import { gateSliceOf } from "~/modules/run/run/domain/rebase.model";
import { isPrepPhase } from "~/modules/run/run/domain/run.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import {
	findActiveSessionRun,
	loadRunState,
} from "~/modules/run/run/infrastructure/run.repository";

const NOTHING_TO_APPROVE: ApprovalBoard = { slots: [], refusal: null };

export const getApprovalSlotsService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<ApprovalBoard>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		const state = await loadRunState(run.id);
		if (!isPrepPhase(state)) return NOTHING_TO_APPROVE;

		const refusal = approvalRefusalOf(state) ?? null;
		if (refusal === "offline") return { slots: [], refusal };

		const slice = gateSliceOf(state);
		const counts =
			refusal === null
				? await fetchApprovalCounts(slice.map((poll) => Number(poll.id)))
				: {};

		return {
			slots: slice.map((poll) => ({
				pollId: poll.id,
				category: poll.category,
				ready: (counts[Number(poll.id)] ?? 0) >= APPROVALS_NEEDED,
			})),
			refusal,
		};
	}, "getApprovalSlots");

const crowdPick = async (userId: string): Promise<readonly string[]> => {
	const run = await findActiveSessionRun(userId);
	if (!run) throw new Error("No active run");

	const state = await loadRunState(run.id);
	if (state.status !== "answering")
		throw new Error("No poll is open to approve");

	const poll = approvedPollOf(state);
	if (!poll) throw new Error("This poll was never approved");

	const split = await fetchPollSplit(Number(poll.id));
	if (split.answeredCount < APPROVALS_NEEDED)
		throw new Error("This poll does not have enough approvals yet");

	const optionIds = crowdPickFor(
		split,
		poll.options.map((option) => option.id)
	);
	if (optionIds.length === 0)
		throw new Error("The room has picked nothing this poll still offers");

	return optionIds;
};

export const submitCrowdPickService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView>> => {
	const picked = await handleApiOperation(
		() => crowdPick(userId),
		"submitCrowdPick"
	);
	if (!picked.success) return picked;

	return dispatchRunActionService({
		userId,
		date,
		action: { type: "answer", optionIds: picked.data },
	});
};
