import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getTodaysRun } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const todaysRunQueryKey = () =>
	sessionRunQueryKeys.today(getTodayDateString());

export const useTodaysRun = () => {
	const result = useApiQuery<RunView | null>({
		queryKey: todaysRunQueryKey(),
		queryFn: () => getTodaysRun(),
	});

	return {
		...result,
		statusUnknown: result.isPending || result.errorMessage !== null,
	};
};
