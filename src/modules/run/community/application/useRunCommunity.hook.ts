import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";

export const runCommunityQueryKey = () =>
	sessionRunQueryKeys.community(getTodayDateString());

/**
 * Today's community board. The mirror of `useTodaysRun`, and named the same way
 * on purpose: the key lives here rather than at the call site so `useRunActions`
 * has something to invalidate. Answering a poll moves the board — a new answer,
 * a claimed seat, a moved climb marker — and nothing used to tell it so.
 */
export const useRunCommunity = () =>
	useApiQuery<RunCommunityView>({
		queryKey: runCommunityQueryKey(),
		queryFn: () => getRunCommunity(),
	});
