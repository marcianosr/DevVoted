import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
} from "~/modules/run/run/application/run.serverfn";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import { userQueryKeys } from "~/shared/queryKeys";

import { runCommunityQueryKey } from "~/modules/run/community/application/useRunCommunity.hook";
import { attackTargetsQueryKey } from "~/modules/run/incident/application/useAttackTargets.hook";
import { incidentsFeedQueryKey } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { todaysRunQueryKey } from "~/modules/run/run/application/useTodaysRun.hook";

export type RunActionResult = Awaited<ReturnType<typeof dispatchRunAction>>;
export type RunActionSuccess = Extract<RunActionResult, { success: true }>;

export const useRunActions = () => {
	const queryClient = useQueryClient();
	const queryKey = todaysRunQueryKey();

	const invalidateSideViews = () => {
		queryClient.invalidateQueries({ queryKey: runCommunityQueryKey() });
		queryClient.invalidateQueries({ queryKey: userQueryKeys.swatchesAll });
		queryClient.invalidateQueries({ queryKey: userQueryKeys.unlocksAll });
		queryClient.invalidateQueries({
			queryKey: userQueryKeys.serviceUnlocksAll,
		});
		queryClient.invalidateQueries({ queryKey: attackTargetsQueryKey() });
		queryClient.invalidateQueries({ queryKey: incidentsFeedQueryKey() });
	};

	const commit = (result: RunActionSuccess) => {
		queryClient.setQueryData(queryKey, result);
		invalidateSideViews();
	};

	const dispatch = useMutation({
		mutationFn: (action: RunAction) => dispatchRunAction({ data: { action } }),
	});

	const send = (action: RunAction) =>
		dispatch.mutate(action, {
			onSuccess: (result) => {
				if (result.success) commit(result);
			},
		});

	const sendWith = (
		action: RunAction,
		onResult: (result: RunActionResult) => void
	) => dispatch.mutate(action, { onSuccess: (result) => onResult(result) });

	const start = useMutation({
		mutationFn: () => startRun(),
		onSuccess: (result) => {
			if (result.success) queryClient.setQueryData(queryKey, result);
		},
	});

	const abandon = useMutation({
		mutationFn: () => abandonRun(),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.invalidateQueries({ queryKey });
			invalidateSideViews();
		},
	});

	return { send, sendWith, commit, busy: dispatch.isPending, start, abandon };
};
