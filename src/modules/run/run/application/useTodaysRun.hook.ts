import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getTodaysRun } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const useTodaysRun = (enabled = true) => {
	const result = useApiQuery<RunView | null>({
		queryKey: sessionRunQueryKeys.todaysRun(),
		queryFn: () => getTodaysRun(),
		enabled,
	});

	return {
		...result,
		statusUnknown: result.isPending || result.errorMessage !== null,
	};
};
