import { getPollDetail } from "~/modules/polls/poll/application/poll.serverfn";
import type { PollDetailData } from "~/modules/polls/poll/application/poll.service";
import { pollQueryKeys } from "~/shared/queryKeys";
import {
	useApiQuery,
	type ApiQueryResult,
} from "~/shared/hooks/useApiQuery.hook";

export const usePollDetail = (pollId: number): ApiQueryResult<PollDetailData> =>
	useApiQuery({
		queryKey: pollQueryKeys.detail(pollId),
		queryFn: () => getPollDetail({ data: { id: pollId } }),
		retry: false,
	});
