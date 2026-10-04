import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type { dispatchRunAction } from "~/modules/run/run/application/run.serverfn";
import {
	archiveQueryKeys,
	hallOfFameQueryKeys,
	pollQueryKeys,
	sessionRunQueryKeys,
	titleQueryKeys,
	userQueryKeys,
} from "~/shared/queryKeys";

export type RunActionResult = Awaited<ReturnType<typeof dispatchRunAction>>;
export type RunActionSuccess = Extract<RunActionResult, { success: true }>;

const sideViewKeysOf = () => [
	sessionRunQueryKeys.todaysPollsLeft(),
	sessionRunQueryKeys.todaysCommunity(),
	sessionRunQueryKeys.todaysAttackTargets(),
	sessionRunQueryKeys.todaysIncidents(),
	sessionRunQueryKeys.todaysApprovalSlots(),
	sessionRunQueryKeys.runNumber(),
	userQueryKeys.all,
	titleQueryKeys.all,
	archiveQueryKeys.all,
	pollQueryKeys.polldexAll(),
	hallOfFameQueryKeys.all,
];

export const useRunCommit = () => {
	const queryClient = useQueryClient();

	return useMemo(() => {
		const todaysRun = sessionRunQueryKeys.todaysRun();
		const invalidateSideViews = () => {
			for (const queryKey of sideViewKeysOf())
				queryClient.invalidateQueries({ queryKey });
		};

		return {
			commit: (result: RunActionSuccess) => {
				queryClient.setQueryData(todaysRun, result);
				invalidateSideViews();
			},
			refresh: () => {
				queryClient.invalidateQueries({ queryKey: todaysRun });
				invalidateSideViews();
			},
		};
	}, [queryClient]);
};
