import type {
	CreatePollWithOptionsInput,
	UpdatePollInput,
} from "~/modules/polls/authoring/application/poll.validation";
import {
	createPollWithOptions,
	fetchPublishedCountIn,
	fetchPublishedCounts,
	fetchUnannouncedPublishedPolls,
	markPollReviewed,
	markPollsAnnounced,
	updatePollWithOptions,
	type AnnouncedPoll,
} from "~/modules/polls/authoring/infrastructure/authoring.repository";
import type { Poll } from "~/modules/polls/poll/domain/poll.model";
import {
	bountyKbFor,
	categoryBountiesOf,
	type CategoryBounty,
} from "~/modules/polls/poll/domain/pollBounty.model";
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
	handleApiOperation(async () => {
		const published = await fetchPublishedCountIn(poll.categoryCode);
		return createPollWithOptions(
			{
				...poll,
				status: "draft",
				createdBy: author.userId,
				authorRewardKb: bountyKbFor(published),
			},
			options
		);
	}, "suggestPoll");

export const getCategoryBounties = async (): Promise<
	ApiResponse<CategoryBounty[]>
> =>
	handleApiOperation(
		async () => categoryBountiesOf(await fetchPublishedCounts()),
		"getCategoryBounties"
	);

const editAndReview = async ({
	id,
	poll,
	options,
	reviewed = false,
}: UpdatePollInput): Promise<Poll> => {
	const edited = await updatePollWithOptions(id, poll, options);
	return reviewed ? markPollReviewed(id, new Date()) : edited;
};

export const editPoll = async (
	viewer: PollViewer,
	edit: UpdatePollInput
): Promise<ApiResponse<Poll>> =>
	canAdministerPolls(viewer)
		? handleApiOperation(() => editAndReview(edit), "editPoll")
		: createErrorResponse(new Error(ADMIN_REQUIRED));

export const reviewPoll = async (
	viewer: PollViewer,
	pollId: number
): Promise<ApiResponse<Poll>> =>
	canAdministerPolls(viewer)
		? handleApiOperation(
				() => markPollReviewed(pollId, new Date()),
				"reviewPoll"
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
