import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getPollsLeftToday } from "~/modules/run/run/application/run.serverfn";

export const usePollsLeftToday = (enabled = true) =>
	useApiQuery<number>({
		queryKey: sessionRunQueryKeys.todaysPollsLeft(),
		queryFn: () => getPollsLeftToday(),
		enabled,
	});
