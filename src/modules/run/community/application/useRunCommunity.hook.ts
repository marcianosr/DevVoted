import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";

export const runCommunityQueryKey = () =>
	sessionRunQueryKeys.community(getTodayDateString());

/**
 * Today's community board. The mirror of `useTodaysRun`, and named the same way
 * on purpose: the key lives here rather than at the call site so `useRunActions`
 * has something to invalidate. Answering a poll moves the board — a new answer,
 * a new standout, a moved climb marker — and nothing used to tell it so.
 */
export const useRunCommunity = () => {
	const query = useQuery({
		queryKey: runCommunityQueryKey(),
		queryFn: () => getRunCommunity(),
	});

	const response = query.data;
	const view: RunCommunityView | null =
		response?.success === true ? response.data : null;

	// An empty board and a failed fetch both leave `view` null, and they read as
	// opposite things to a player: "answer some polls first" versus "this broke".
	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return { view, isPending: query.isPending, errorMessage };
};
