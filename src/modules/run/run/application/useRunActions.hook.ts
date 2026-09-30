import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
	warmBootRun,
} from "~/modules/run/run/application/run.serverfn";
import type { WireRunAction } from "~/modules/run/run/application/run.validation";
import type { WarmBootPick } from "~/modules/run/run/domain/warmBoot.model";
import {
	archiveQueryKeys,
	sessionRunQueryKeys,
	userQueryKeys,
} from "~/shared/queryKeys";

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
		mutationFn: (action: WireRunAction) =>
			dispatchRunAction({ data: { action } }),
	});

	const send = (action: WireRunAction) =>
		dispatch.mutate(action, {
			onSuccess: (result) => {
				if (result.success) commit(result);
			},
		});

	const sendWith = (
		action: WireRunAction,
		onResult: (result: RunActionResult) => void
	) => dispatch.mutate(action, { onSuccess: (result) => onResult(result) });

	const start = useMutation({
		mutationFn: () => startRun(),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.setQueryData(queryKey, result);
			queryClient.invalidateQueries({
				queryKey: sessionRunQueryKeys.runNumber(),
			});
		},
	});

	const warmBoot = useMutation({
		mutationFn: (pick: WarmBootPick) =>
			warmBootRun({ data: { ...pick, serviceIds: [...pick.serviceIds] } }),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.setQueryData(queryKey, result);
			queryClient.invalidateQueries({ queryKey: archiveQueryKeys.all });
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

	return {
		send,
		sendWith,
		commit,
		busy: dispatch.isPending,
		start,
		warmBoot,
		abandon,
	};
};
