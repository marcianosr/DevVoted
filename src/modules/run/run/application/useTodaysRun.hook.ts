import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getTodayDateString } from "~/shared/lib/dateUtils";
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
	const query = useQuery({
		queryKey: todaysRunQueryKey(),
		queryFn: () => getTodaysRun(),
	});

	const response = query.data;
	const view: RunView | null =
		response?.success === true ? response.data : null;

	// A rejected query counts too. `view === null` is a real answer — "no run
	// today, start one" — so a failure that also produced null would otherwise
	// be indistinguishable from it, and the route sync would act on a guess.
	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return {
		view,
		isPending: query.isPending,
		errorMessage,
		/** `view` is only trustworthy — including when it is null — once this is false. */
		statusUnknown: query.isPending || errorMessage !== null,
	};
};
