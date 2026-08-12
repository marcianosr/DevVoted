import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
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

	const view: RunView | null =
		query.data?.success === true ? query.data.data : null;
	const errorMessage = query.data?.success === false ? query.data.error : null;

	return { view, isPending: query.isPending, errorMessage };
};
