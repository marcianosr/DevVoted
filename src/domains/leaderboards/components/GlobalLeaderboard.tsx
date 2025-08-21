import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "../models/leaderboard";
import { getCategories, type CategoryCode } from "~/domains/shared/categories";

type GlobalLeaderboardProps = {
	entries: LeaderboardEntry[];
	title?: string;
	getCategoryLeaderboard: (opts: {
		data: { categoryCode?: CategoryCode };
	}) => Promise<LeaderboardEntry[]>;
};

type CategoryOption = {
	code?: CategoryCode;
	name: string;
};

const CATEGORIES: CategoryOption[] = [
	{ name: "Global" }, // undefined categoryCode = global
	...getCategories(),
];

export const GlobalLeaderboard = ({
	entries: initialEntries,
	title = "Leaderboards",
	getCategoryLeaderboard,
}: GlobalLeaderboardProps) => {
	const [selectedCategory, setSelectedCategory] = useState<
		CategoryCode | undefined
	>(undefined);

	// Query for category-specific leaderboard
	const categoryQuery = useQuery({
		queryKey: ["leaderboard", "category", selectedCategory],
		queryFn: () =>
			getCategoryLeaderboard({
				data: { categoryCode: selectedCategory },
			}),
		enabled: selectedCategory !== undefined,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Use category-specific entries if available, otherwise use initial entries
	const entries =
		selectedCategory !== undefined && categoryQuery.data
			? categoryQuery.data
			: initialEntries;
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
			{/* Category Tabs */}
			<div className="flex flex-wrap gap-1 mb-2">
				{CATEGORIES.map((category) => {
					const isSelected = selectedCategory === category.code;
					const isLoading =
						selectedCategory === category.code &&
						categoryQuery.isLoading;

					return (
						<button
							key={category.code || "global"}
							onClick={() => setSelectedCategory(category.code)}
							disabled={isLoading}
							className={`px-2 py-1 text-xs font-mono border rounded transition-colors ${
								isSelected
									? "bg-gray-700 border-gray-500 text-white"
									: "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300"
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
					? `${CATEGORIES.find((c) => c.code === selectedCategory)?.name} Category XP`
					: "Total XP"}{" "}
				(min 5 polls)
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
