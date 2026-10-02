import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getRunRecap } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const useRunRecap = (runId: number) =>
	useApiQuery<RunView>({
		queryKey: sessionRunQueryKeys.recap(runId),
		queryFn: () => getRunRecap({ data: { runId } }),
		enabled: Number.isInteger(runId) && runId > 0,
	});
