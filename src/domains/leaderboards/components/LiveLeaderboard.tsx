import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, type CategoryCode } from "~/domains/shared/categories";
import type { ApiResponse } from "~/utils/errorHandling";

type LiveLeaderboardEntry = {
	userId: string;
	displayName: string;
	runId: number;
	totalXp: number;
	totalPollsAnswered: number;
	bestStreak: number;
	categoryCode?: CategoryCode; // Present for category-specific rankings
};

type CategoryOption = {
	code?: CategoryCode;
	name: string;
};

type LiveLeaderboardProps = {
	entries: LiveLeaderboardEntry[];
	currentUserId?: string;
	className?: string;
	getLiveLeaderboard: (opts: {
		data: { categoryCode?: CategoryCode };
	}) => Promise<ApiResponse<LiveLeaderboardEntry[]>>;
};

const CATEGORIES: CategoryOption[] = [
	{ name: "Total" }, // undefined categoryCode = total across all categories
	...getCategories(),
];

export const LiveLeaderboard = ({
	entries: initialEntries,
	currentUserId,
	className = "",
	getLiveLeaderboard,
}: LiveLeaderboardProps) => {
	const [selectedCategory, setSelectedCategory] = useState<
		CategoryCode | undefined
	>(undefined);

	// Query for category-specific live leaderboard
	const categoryQuery = useQuery({
		queryKey: ["liveLeaderboard", "category", selectedCategory],
		queryFn: () =>
			getLiveLeaderboard({
				data: { categoryCode: selectedCategory },
			}),
		enabled: selectedCategory !== undefined,
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: 45 * 1000, // Auto-refresh every 45 seconds
	});

	// Use category-specific entries if available, otherwise use initial entries (total)
	const entries =
		selectedCategory !== undefined &&
		categoryQuery.data?.success &&
		categoryQuery.data.data
			? categoryQuery.data.data
			: initialEntries;
	const getRankColor = (rank: number, isCurrentUser: boolean) => {
		if (isCurrentUser) return "text-cyan-400"; // Highlight current user
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
				return "👑";
			case 2:
				return "🥈";
			case 3:
				return "🥉";
			default:
				return `#${rank}`;
		}
	};

	// Find current user's position
	const currentUserRank =
		entries.findIndex((entry) => entry.userId === currentUserId) + 1;

	return (
		<div
			className={`bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm ${className}`}
		>
			{/* Header */}
			<div className="border-b border-gray-600 pb-2 mb-3">
				<div className="text-white font-bold">🔴 Live Rankings</div>
				<div className="text-gray-400 text-xs">
					{entries.length} active players • Updates every 45s
					{currentUserRank > 0 && (
						<span className="text-cyan-400 ml-2">
							• You're #{currentUserRank}
						</span>
					)}
				</div>
			</div>

			{/* Category Tabs */}
			<div className="flex flex-wrap gap-1 mb-2">
				{CATEGORIES.map((category) => {
					const isSelected = selectedCategory === category.code;
					const isLoading =
						selectedCategory === category.code &&
						categoryQuery.isLoading;

					return (
						<button
							key={category.code || "total"}
							onClick={() => setSelectedCategory(category.code)}
							disabled={isLoading}
							className={`px-2 py-1 text-xs font-mono border rounded transition-colors ${
								isSelected
									? "bg-red-900 border-red-600 text-red-300"
									: "bg-transparent border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-300"
							} ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
						>
							{isLoading ? "..." : `[ ${category.name} ]`}
						</button>
					);
				})}
			</div>

			<div className="text-gray-400 text-xs mb-4">
				Metric:{" "}
				{selectedCategory
					? `${CATEGORIES.find((c) => c.code === selectedCategory)?.name} XP`
					: "Total XP"}{" "}
			</div>

			{/* Live Rankings */}
			<div className="space-y-1">
				{entries.map((entry, index) => {
					const rank = index + 1;
					const isCurrentUser = entry.userId === currentUserId;
					const accuracy =
						entry.totalPollsAnswered > 0
							? (
									entry.totalXp / entry.totalPollsAnswered
								).toFixed(1)
							: "0.0";

					return (
						<div
							key={`${entry.userId}-${entry.runId}`}
							className={`flex items-center font-mono ${
								isCurrentUser
									? "bg-gray-800 bg-opacity-50 px-2 py-1 rounded"
									: ""
							}`}
						>
							{/* Rank */}
							<div
								className={`w-8 ${getRankColor(rank, isCurrentUser)} font-bold text-sm`}
							>
								{getRankSymbol(rank)}
							</div>

							{/* Player name */}
							<div
								className={`flex-1 truncate mr-4 min-w-0 ${
									isCurrentUser
										? "text-cyan-400 font-bold"
										: "text-white"
								}`}
							>
								{entry.displayName || "Anonymous"}
								{isCurrentUser && (
									<span className="text-cyan-300 text-xs ml-1">
										(you)
									</span>
								)}
							</div>

							{/* XP and stats */}
							<div className="flex items-center space-x-2 text-xs">
								{/* Total XP */}
								<div
									className={`font-bold mr-2 text-right min-w-[3rem] ${
										isCurrentUser
											? "text-cyan-400"
											: "text-green-400"
									}`}
								>
									{entry.totalXp} XP
								</div>

								{/* Accuracy */}
								<div
									className={`${
										isCurrentUser
											? "text-cyan-300"
											: "text-gray-400"
									}`}
								>
									({accuracy})
								</div>

								{/* Best streak */}
								{entry.bestStreak > 2 && (
									<div className="text-orange-400">
										🔥{entry.bestStreak}
									</div>
								)}

								{/* Polls answered */}
								<div className="text-gray-500 text-xs">
									{entry.totalPollsAnswered}p
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{entries.length === 0 && (
				<div className="text-gray-500 text-center py-4 font-mono">
					No active players right now
				</div>
			)}

			{/* Footer */}
			<div className="border-t border-gray-600 pt-2 mt-3">
				<div className="text-gray-400 text-xs">
					🔥 Best Streak • (accuracy) • p = polls answered
				</div>
			</div>
		</div>
	);
};
