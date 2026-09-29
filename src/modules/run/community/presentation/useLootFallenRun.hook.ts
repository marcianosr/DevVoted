import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";

import { lootFallenRun } from "~/modules/run/community/application/community.serverfn";

export const useLootFallenRun = () => {
	const queryClient = useQueryClient();
	const date = getTodayDateString();

	const claim = useMutation({
		mutationFn: (runId: number) => lootFallenRun({ data: { runId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: sessionRunQueryKeys.community(date),
			});
			queryClient.invalidateQueries({
				queryKey: sessionRunQueryKeys.today(date),
			});
		},
	});

	return {
		onLoot: (runId: number) => claim.mutate(runId),
		pendingRunId: claim.isPending ? claim.variables : undefined,
		errorMessage: claim.data?.success === false ? claim.data.error : null,
	};
};
