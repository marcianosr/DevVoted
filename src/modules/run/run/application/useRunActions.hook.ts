import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	abandonRun,
	dispatchRunAction,
	startRun,
} from "~/modules/run/run/application/run.serverfn";
import type { RunActionInput } from "~/modules/run/run/application/run.validation";

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

	const commit = (result: RunActionSuccess) =>
		queryClient.setQueryData(queryKey, result);

	const dispatch = useMutation({
		mutationFn: (action: RunActionInput) =>
			dispatchRunAction({ data: { action } }),
	});

	/** Dispatch an action and commit the resulting view — the default. */
	const send = (action: RunActionInput) =>
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
		action: RunActionInput,
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
			if (result.success) queryClient.invalidateQueries({ queryKey });
		},
	});

	return { send, sendWith, commit, busy: dispatch.isPending, start, abandon };
};
