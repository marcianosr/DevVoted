import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
} from "~/modules/run/run/application/run.serverfn";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import { userQueryKeys } from "~/shared/queryKeys";

import { runCommunityQueryKey } from "~/modules/run/community/application/useRunCommunity.hook";
import { todaysRunQueryKey } from "~/modules/run/run/application/useTodaysRun.hook";

export type RunActionResult = Awaited<ReturnType<typeof dispatchRunAction>>;
export type RunActionSuccess = Extract<RunActionResult, { success: true }>;

/**
 * Mutations for the run flow. Committing a result writes the returned RunView
 * into the query cache — the layout's route sync reacts to the new status, so
 * actions never navigate themselves.
 */
export const useRunActions = () => {
	const queryClient = useQueryClient();
	const queryKey = todaysRunQueryKey();

	/**
	 * The two caches a run action moves without returning them. Both are marked
	 * stale rather than refetched — neither is mounted while the run is being
	 * played, so they reload when the player next opens them. Every action
	 * invalidates both rather than only the ones that qualify: an answer moves
	 * the board, a gate clear awards a swatch, and a stale mark is cheaper than
	 * a rule about which action did what.
	 */
	const invalidateSideViews = () => {
		queryClient.invalidateQueries({ queryKey: runCommunityQueryKey() });
		queryClient.invalidateQueries({ queryKey: userQueryKeys.swatchesAll });
	};

	const commit = (result: RunActionSuccess) => {
		queryClient.setQueryData(queryKey, result);
		invalidateSideViews();
	};

	const dispatch = useMutation({
		mutationFn: (action: RunAction) => dispatchRunAction({ data: { action } }),
	});

	/** Dispatch an action and commit the resulting view — the default. */
	const send = (action: RunAction) =>
		dispatch.mutate(action, {
			onSuccess: (result) => {
				if (result.success) commit(result);
			},
		});

	/**
	 * Dispatch without committing, handing the result to the caller — for beats
	 * that stage the new view before it lands (the answer reveal) or that must
	 * act right after committing (shop → community detour).
	 */
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
			// A quit takes you off the climb map too.
			invalidateSideViews();
		},
	});

	return { send, sendWith, commit, busy: dispatch.isPending, start, abandon };
};
