import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getPollSplit } from "~/modules/run/community/application/community.serverfn";
import type { PollSplit } from "~/modules/run/community/domain/pollSplit.model";

export const pollSplitQueryKey = (pollId: number) =>
	sessionRunQueryKeys.pollSplit(pollId);

/**
 * The bought split for the poll on screen. Runs only once the engine says this
 * poll is paid for, so the query firing at all is the tell that the fee went
 * through — there is no unpaid state to render, and no request to refuse.
 */
export const usePollSplit = ({
	pollId,
	paid,
}: {
	pollId: string | null;
	paid: boolean;
}) => {
	const numericId = pollId === null ? null : Number(pollId);
	const enabled = paid && numericId !== null && Number.isFinite(numericId);

	const query = useQuery({
		queryKey: sessionRunQueryKeys.pollSplit(numericId ?? 0),
		queryFn: () => getPollSplit({ data: { pollId: Number(numericId) } }),
		enabled,
	});

	const response = query.data;
	const split: PollSplit | null =
		response?.success === true ? response.data : null;

	return {
		split,
		isPending: enabled && query.isPending,
		errorMessage:
			response?.success === false
				? response.error
				: (query.error?.message ?? null),
	};
};
