import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getTodaysRun } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const todaysRunQueryKey = () =>
	sessionRunQueryKeys.today(getTodayDateString());

/**
 * Today's run, shared by every screen in the /run flow. Each screen calls this
 * independently — the shared query key means one fetch feeds them all, so no
 * props need to travel through the route tree.
 */
export const useTodaysRun = () => {
	// `RunView | null` rather than `RunView`: "no run today" is a successful
	// response carrying null, not a failure. `view` folds that into the same null
	// a failure produces, which is what `statusUnknown` exists to disambiguate.
	const result = useApiQuery<RunView | null>({
		queryKey: todaysRunQueryKey(),
		queryFn: () => getTodaysRun(),
	});

	return {
		...result,
		/** `view` is only trustworthy — including when it is null — once this is false. */
		statusUnknown: result.isPending || result.errorMessage !== null,
	};
};
