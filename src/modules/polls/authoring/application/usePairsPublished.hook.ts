import { getPairsPublished } from "~/modules/polls/authoring/application/authoring.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

const PAIRS_PUBLISHED_STALE_MS = 1000 * 60 * 30;

export const usePairsPublished = () =>
	useApiQuery({
		queryKey: pollQueryKeys.pairsPublished(),
		queryFn: () => getPairsPublished(),
		staleTime: PAIRS_PUBLISHED_STALE_MS,
	});
