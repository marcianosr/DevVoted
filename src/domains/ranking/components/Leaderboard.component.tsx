import { useQuery } from "@tanstack/react-query";

import { DEFAULT_WINDOW_SIZE } from "~/domains/runs/services/pipelineEvaluator.service";
import { calculateLevelAndCoverage } from "~/domains/runs/utils/levelCalculations";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import { LeaderboardUI } from "~/ui/ranking/LeaderboardUI.ui";

import { getLeaderboard } from "../api/leaderboards";

export const LEADERBOARD_REFRESH_INTERVAL = 3 * 60 * 1000;

const getPlayerGateNumber = (pollsSeen: number): number =>
	Math.max(1, Math.ceil(pollsSeen / DEFAULT_WINDOW_SIZE));

type LeaderboardProps = {
	categoryCode: CategoryCode;
};

const Leaderboard = ({ categoryCode }: LeaderboardProps) => {
	const { data, isLoading, error } = useQuery({
		queryKey: [categoryCode],
		queryFn: () => getLeaderboard({ data: { categoryCode } }),
		enabled: categoryCode !== undefined,
		staleTime: 15 * 1000,
		refetchInterval: LEADERBOARD_REFRESH_INTERVAL,
	});

	const categoryName = getCategoryMetadata(categoryCode).name;
	const isError = !!(error || (data && !data.success));
	const entries = data?.success
		? data.data.map((entry) => {
				const { displayCoverage, level } = calculateLevelAndCoverage(
					entry.totalCoverage
				);
				return {
					userId: entry.userId,
					displayName: entry.displayName,
					role: entry.role,
					photoUrl: entry.photoUrl || "",
					displayCoverage,
					level,
					gateNumber: getPlayerGateNumber(entry.pollsSeen),
					totalCoverage: entry.totalCoverage,
					bestStreak: entry.bestStreak,
					currentStreak: entry.currentStreak,
					correctPolls: entry.correctPolls,
				};
			})
		: [];

	return (
		<LeaderboardUI
			entries={entries}
			categoryName={categoryName}
			isLoading={isLoading}
			isError={isError}
		/>
	);
};

export default Leaderboard;
