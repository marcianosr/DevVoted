import type {
	CreatePollWithOptionsInput,
	UpdatePollInput,
} from "~/modules/polls/authoring/application/poll.validation";
import {
	createPollWithOptions,
	fetchUnannouncedPublishedPolls,
	markPollsAnnounced,
	updatePollWithOptions,
	type AnnouncedPoll,
} from "~/modules/polls/authoring/infrastructure/authoring.repository";
import type { Poll } from "~/modules/polls/poll/domain/poll.model";
import {
	canAdministerPolls,
	type PollViewer,
} from "~/modules/polls/poll/domain/pollAccess.model";
import { ADMIN_REQUIRED } from "~/shared/utils/authorization";
import {
	createErrorResponse,
	handleApiOperation,
	type ApiResponse,
} from "~/shared/utils/errorHandling";

export const suggestPoll = async (
	author: PollViewer,
	{ poll, options }: CreatePollWithOptionsInput
): Promise<ApiResponse<Poll>> =>
	handleApiOperation(
		() =>
			createPollWithOptions(
				{ ...poll, status: "draft", createdBy: author.userId },
				options
			),
		"suggestPoll"
	);

export const editPoll = async (
	viewer: PollViewer,
	{ id, poll, options }: UpdatePollInput
): Promise<ApiResponse<Poll>> =>
	canAdministerPolls(viewer)
		? handleApiOperation(
				() => updatePollWithOptions(id, poll, options),
				"editPoll"
			)
		: createErrorResponse(new Error(ADMIN_REQUIRED));

export type ApprovalNotice = { readonly polls: readonly AnnouncedPoll[] };

const NOTHING_APPROVED: ApprovalNotice = { polls: [] };

export const getApprovalNotice = async (
	viewer: PollViewer
): Promise<ApiResponse<ApprovalNotice>> =>
	handleApiOperation(
		async () =>
			viewer.isAdmin
				? NOTHING_APPROVED
				: { polls: await fetchUnannouncedPublishedPolls(viewer.userId) },
		"getApprovalNotice"
	);

export const acknowledgeApprovals = async (
	userId: string,
	pollIds: readonly number[]
) =>
	handleApiOperation(async () => {
		await markPollsAnnounced(userId, pollIds);
		return { acknowledged: pollIds };
	}, "acknowledgeApprovals");
