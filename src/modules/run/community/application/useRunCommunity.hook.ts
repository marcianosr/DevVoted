import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";

export const useRunCommunity = () =>
	useApiQuery<RunCommunityView>({
		queryKey: sessionRunQueryKeys.todaysCommunity(),
		queryFn: () => getRunCommunity(),
	});
