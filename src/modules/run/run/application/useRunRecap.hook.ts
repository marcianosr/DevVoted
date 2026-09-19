import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { getRunRecap } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const runRecapQueryKey = (runId: number) =>
	sessionRunQueryKeys.recap(runId);

/**
 * A finished run, read-only. Unlike `useTodaysRun` this takes an id, because
 * the archive holds many runs and only the live one can be resolved from the
 * session. The server still decides whether this viewer may see it.
 */
export const useRunRecap = (runId: number) => {
	const query = useQuery({
		queryKey: runRecapQueryKey(runId),
		queryFn: () => getRunRecap({ data: { runId } }),
		enabled: Number.isInteger(runId) && runId > 0,
	});

	const response = query.data;
	const view: RunView | null =
		response?.success === true ? response.data : null;

	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return { view, isPending: query.isPending, errorMessage };
};
