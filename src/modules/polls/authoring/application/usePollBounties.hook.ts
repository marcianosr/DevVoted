import { getPollBounties } from "~/modules/polls/authoring/application/authoring.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

const BOUNTIES_STALE_MS = 1000 * 60 * 30;

export const usePollBounties = () =>
	useApiQuery({
		queryKey: pollQueryKeys.bounties(),
		queryFn: () => getPollBounties(),
		staleTime: BOUNTIES_STALE_MS,
	});
