import { useQuery } from "@tanstack/react-query";

import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";

import { getLeaderboard } from "../api/leaderboards";

type LeaderboardProps = {
	categoryCode: CategoryCode;
};

/**
 * Leaderboard refresh interval (3 minutes)

 * Rationale: Leaderboard queries are expensive (multi-table joins with aggregation).
 * A 3-minute interval reduces database load by 75% compared to 45s while still
 * providing reasonably fresh competitive rankings.
 */
export const LEADERBOARD_REFRESH_INTERVAL = 3 * 60 * 1000;

const Leaderboard = ({ categoryCode }: LeaderboardProps) => {
	const { data, isLoading, error } = useQuery({
		queryKey: [categoryCode],
		queryFn: () =>
			getLeaderboard({
				data: { categoryCode: categoryCode },
			}),
		enabled: categoryCode !== undefined,
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: LEADERBOARD_REFRESH_INTERVAL,
	});

	return (
		<section className="hidden sm:block">
			{isLoading && <p className="text-white">Loading leaderboard</p>}

			{error && <p className="text-red-500">Failed to load leaderboard</p>}

			<h2 className="text-3xl mt-8 mb-4 text-theme">
				{getCategoryMetadata(categoryCode).name} category rankings
			</h2>
			<header>
				<div className="grid sm:grid-cols-[30px_1fr_120px_120px_120px] gap-8 mb-2 border-b border-theme pb-4">
					<span>Rank</span>
					<span>Player</span>
					<span>Coverage</span>
					<span>Best Streak</span>
					<span>Polls</span>
				</div>
			</header>
			<ol>
				{data?.success &&
					data.data.map((entry, idx) => (
						<li
							key={entry.userId}
							className="grid sm:grid-cols-[30px_1fr_120px_120px_120px] gap-8 pt-4"
						>
							<span>{idx + 1}.</span>{" "}
							<span className="truncate">{entry.displayName}</span>{" "}
							<span>{entry.totalCoverage}% </span>
							<span>{entry.bestStreak} </span>
							<span>{entry.pollsAnswered} </span>
						</li>
					))}
			</ol>
		</section>
	);
};

export default Leaderboard;
