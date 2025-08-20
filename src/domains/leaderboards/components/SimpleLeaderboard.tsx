import type { LeaderboardEntry } from "../models/leaderboard";

interface SimpleLeaderboardProps {
	entries: LeaderboardEntry[];
	title?: string;
}

export const SimpleLeaderboard = ({
	entries,
	title = "Leaderboards",
}: SimpleLeaderboardProps) => {
	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1:
				return "text-yellow-400"; // Gold
			case 2:
				return "text-gray-300"; // Silver
			case 3:
				return "text-amber-600"; // Bronze
			default:
				return "text-gray-500";
		}
	};

	const getRankSymbol = (rank: number) => {
		switch (rank) {
			case 1:
				return "#1";
			case 2:
				return "#2";
			case 3:
				return "#3";
			default:
				return `#${rank}`;
		}
	};

	return (
		<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
			{/* Header */}
			<div className="border-b border-gray-600 pb-2 mb-3">
				<div className="text-white font-bold">{title}</div>
			</div>
			<div className="text-gray-400 text-xs mb-2">
				Tabs: [ Global ] [ React ] [ CSS ] [ TS ]
			</div>
			<div className="text-gray-400 text-xs mb-4">
				Metric: XP/Poll (min 5 polls)
			</div>
			<div className="space-y-1">
				{entries.map((entry, index) => {
					const rank = index + 1;
					const xpPerPoll =
						entry.pollsAnswered > 0
							? (entry.totalXp / entry.pollsAnswered).toFixed(2)
							: "0.00";

					return (
						<div
							key={`${entry.userId}-${entry.runId}`}
							className="flex items-center font-mono"
						>
							<div
								className={`w-8 ${getRankColor(rank)} font-bold text-sm`}
							>
								{getRankSymbol(rank)}
							</div>
							<div className="text-white flex-1 truncate mr-4 min-w-0">
								{entry.displayName || "Anonymous"}
							</div>
							<div className="text-green-400 font-bold mr-4 text-right min-w-[3rem]">
								{entry.totalXp} XP ({xpPerPoll} acc.)
							</div>
							<div className="text-gray-400 text-xs whitespace-nowrap">
								(Run #{entry.runId}: {entry.pollsAnswered}/
								{entry.pollsAnswered})
							</div>
						</div>
					);
				})}
			</div>

			{entries.length === 0 && (
				<div className="text-gray-500 text-center py-4 font-mono">
					No leaderboard data available
				</div>
			)}

			{/* Footer actions */}
			<div className="border-t border-gray-600 pt-2 mt-4">
				<div className="text-gray-400 text-xs">
					[ View Player ] [ Filter by Season ]
				</div>
			</div>
		</div>
	);
};
