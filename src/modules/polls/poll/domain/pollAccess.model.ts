import type { Poll } from "~/modules/polls/poll/domain/poll.model";

export type PollViewer = {
	readonly userId: string;
	readonly isAdmin: boolean;
};

export type PollScope =
	| { readonly kind: "every" }
	| { readonly kind: "authoredBy"; readonly authorId: string };

export const ACCESS_DENIED = "Access denied";

export const pollScopeOf = (viewer: PollViewer): PollScope =>
	viewer.isAdmin
		? { kind: "every" }
		: { kind: "authoredBy", authorId: viewer.userId };

export const isInPollScope = (
	scope: PollScope,
	poll: Pick<Poll, "createdBy">
): boolean => scope.kind === "every" || poll.createdBy === scope.authorId;

export const maySeePoll = (
	viewer: PollViewer,
	poll: Pick<Poll, "createdBy">
): boolean => isInPollScope(pollScopeOf(viewer), poll);

export const canAdministerPolls = (viewer: PollViewer): boolean =>
	viewer.isAdmin;
