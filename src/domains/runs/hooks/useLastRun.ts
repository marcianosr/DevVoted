import { useQuery } from "@tanstack/react-query";

import { getLastRunForGameOver } from "~/domains/runs/api/runs";
import type { CategoryCode } from "~/domains/shared/categories";
import { runQueryKeys } from "~/domains/shared/queryKeys";

type LastRunData = {
	run: {
		id: number;
		started_at: Date | null;
		finished_at: Date | null;
		completion_reason: string | null;
	};
	categoryCoverage: {
		categoryCode: CategoryCode;
		currentCoverage: number;
		currentStreak: number;
		bestStreak: number;
		pollsAnswered: number;
	}[];
	totalCoverage: number;
	totalPollsAnswered: number;
};

export type UseLastRunReturn = {
	lastRunData: LastRunData | null;
	isLoading: boolean;
	error: Error | null;
	hasLastRun: boolean;
};

export const useLastRun = (userId: string | undefined): UseLastRunReturn => {
	const { data, isLoading, error } = useQuery({
		queryKey: runQueryKeys.lastRun(userId),
		queryFn: () => getLastRunForGameOver(),
		enabled: !!userId,
		select: (response) => (response.success ? response.data : null),
		staleTime: 5 * 60 * 1000, // 5 minutes - last run data doesn't change often
		retry: 1,
	});

	return {
		lastRunData: data || null,
		isLoading,
		error,
		hasLastRun: !!data,
	};
};
