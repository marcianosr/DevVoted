import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveRun, getOrCreateRun } from "~/domains/runs/api/runs";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import type { Run } from "~/domains/runs/models/run";

export type UseActiveRunReturn = {
	activeRun: Run | null;
	hasActiveRun: boolean;
	isLoading: boolean;
	isStarting: boolean;
	error: Error | null;
	startError: Error | null;
	startRun: () => void;
	refetchRun: () => void;
	canStartRun: boolean;
	isRunActive: boolean;
};

/**
 * Custom hook for managing active run state and operations
 *
 * Handles:
 * - Fetching user's active run
 * - Starting new runs
 * - Finishing runs
 * - Query cache management
 *
 * @param userId - The user ID to fetch active run for
 * @returns Object with run data, loading states, and actions
 */
export const useActiveRun = (
	userId: string | undefined
): UseActiveRunReturn => {
	const queryClient = useQueryClient();

	const {
		data: activeRunResponse,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: runQueryKeys.active(userId),
		queryFn: () => getActiveRun({ data: { userId: userId || "" } }),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes - runs don't change often
	});

	const startRunMutation = useMutation({
		mutationFn: (userId: string) => getOrCreateRun({ data: { userId } }),
		onSuccess: () => {
			// Invalidate to refresh the run data
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(userId),
			});
		},
	});

	// Derived state
	const hasActiveRun = activeRunResponse?.success ?? false;
	const runData =
		hasActiveRun && activeRunResponse?.success
			? activeRunResponse.data
			: null;

	return {
		activeRun: runData,
		hasActiveRun,

		isLoading,
		isStarting: startRunMutation.isPending,

		error,
		startError: startRunMutation.error,

		startRun: () => userId && startRunMutation.mutate(userId),
		refetchRun: refetch,

		canStartRun: !!userId && !hasActiveRun && !startRunMutation.isPending,
		isRunActive: hasActiveRun && runData?.status === "active",
	};
};
