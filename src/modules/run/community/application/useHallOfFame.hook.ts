import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { hallOfFameQueryKeys } from "~/shared/queryKeys";
import { getHallOfFame } from "~/modules/run/community/application/hallOfFame.serverfn";
import type { HallOfFameView } from "~/modules/run/community/application/hallOfFame.viewmodel";

const HALL_OF_FAME_STALE_MS = 5 * 60_000;

export const useHallOfFame = () =>
	useApiQuery<HallOfFameView>({
		queryKey: hallOfFameQueryKeys.all,
		queryFn: () => getHallOfFame(),
		staleTime: HALL_OF_FAME_STALE_MS,
	});
