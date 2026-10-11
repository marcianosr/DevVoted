import type { Poll } from "~/modules/polls/poll/domain/poll.model";
import {
	ACCESS_DENIED,
	canAdministerPolls,
	maySeePoll,
	pollScopeOf,
	type PollViewer,
} from "~/modules/polls/poll/domain/pollAccess.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import {
	fetchDealCounts,
	fetchDealtPollIdsOn,
	fetchPollByIdWithOptions,
	fetchPollsIn,
	type PollDeal,
} from "~/modules/polls/poll/infrastructure/poll.repository";
import { dayBefore } from "~/shared/lib/dateUtils";
import {
	createErrorResponse,
	createSuccessResponse,
	handleApiOperation,
	type ApiResponse,
} from "~/shared/utils/errorHandling";

export type PollListData = {
	readonly polls: Poll[];
	readonly canAdminister: boolean;
	readonly deals: readonly PollDeal[];
	readonly yesterday: readonly number[];
};

export type PollDetailData = {
	readonly poll: Poll;
	readonly options: PollOption[];
	readonly canAdminister: boolean;
};

export const listPollsFor = async (
	viewer: PollViewer,
	today: string
): Promise<ApiResponse<PollListData>> =>
	handleApiOperation(async () => {
		const polls = await fetchPollsIn(pollScopeOf(viewer));
		const canAdminister = canAdministerPolls(viewer);
		return {
			polls,
			canAdminister,
			deals: await fetchDealCounts(polls.map((poll) => poll.id)),
			yesterday: canAdminister
				? await fetchDealtPollIdsOn(dayBefore(today))
				: [],
		};
	}, "listPollsFor");

export const pollDetailFor = async (
	viewer: PollViewer,
	pollId: number
): Promise<ApiResponse<PollDetailData>> => {
	const found = await handleApiOperation(
		() => fetchPollByIdWithOptions(pollId),
		"pollDetailFor"
	);
	if (!found.success) return found;
	if (!maySeePoll(viewer, found.data.poll)) {
		return createErrorResponse(new Error(ACCESS_DENIED));
	}

	return createSuccessResponse({
		...found.data,
		canAdminister: canAdministerPolls(viewer),
	});
};
