import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";

export const runCommunityQueryKey = () =>
	sessionRunQueryKeys.community(getTodayDateString());

export const useRunCommunity = () =>
	useApiQuery<RunCommunityView>({
		queryKey: runCommunityQueryKey(),
		queryFn: () => getRunCommunity(),
	});
