import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getReviewPolls } from "~/modules/run/community/application/community.serverfn";
import type { RunCommunityPoll } from "~/modules/run/community/application/community.service";

export const useReviewPolls = (pollIds: readonly number[]) =>
	useApiQuery<RunCommunityPoll[]>({
		queryKey: sessionRunQueryKeys.reviewPolls(pollIds),
		queryFn: () => getReviewPolls({ data: { pollIds: [...pollIds] } }),
	});
