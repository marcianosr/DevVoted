import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { getCategories, type CategoryCode } from "~/domains/shared/categories";
import type { ApiResponse } from "~/utils/errorHandling";
import type { LeaderboardEntry } from "../models/leaderboard";
import { LEADERBOARD_REFRESH_INTERVAL } from "~/config/polling";

type CategoryOption = {
	code: CategoryCode;
	name: string;
};

type LeaderboardMode = "live" | "all-time";

type LeaderboardProps = {
	entries: LeaderboardEntry[];
	currentUserId?: string;
	currentCategoryCode: CategoryCode;
	getLeaderboard: (opts: {
		data: { categoryCode?: CategoryCode };
	}) => Promise<ApiResponse<LeaderboardEntry[]>>;
	getAllTimeLeaderboard: (opts: {
		data: { categoryCode?: CategoryCode };
	}) => Promise<ApiResponse<LeaderboardEntry[]>>;
};

const CATEGORIES: CategoryOption[] = [...getCategories()];

export const Leaderboard = ({
	entries: initialEntries,
	currentUserId,
	getLeaderboard,
	getAllTimeLeaderboard,
	currentCategoryCode,
}: LeaderboardProps) => {
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryCode>(currentCategoryCode);
	const [mode, setMode] = useState<LeaderboardMode>("live");

	// Query for category-specific live leaderboard
	const liveCategoryQuery = useQuery({
		queryKey: ["Leaderboard", "live", "category", selectedCategory],
		queryFn: () =>
			getLeaderboard({
				data: { categoryCode: selectedCategory },
			}),
		enabled: selectedCategory !== undefined && mode === "live",
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: LEADERBOARD_REFRESH_INTERVAL,
	});

	// Query for category-specific all-time leaderboard
	const allTimeCategoryQuery = useQuery({
		queryKey: ["Leaderboard", "all-time", "category", selectedCategory],
		queryFn: () =>
			getAllTimeLeaderboard({
				data: { categoryCode: selectedCategory },
			}),
		enabled: selectedCategory !== undefined && mode === "all-time",
		staleTime: 60 * 1000, // 60 seconds (all-time changes less frequently)
	});

	// Use the appropriate query based on mode
	const categoryQuery =
		mode === "live" ? liveCategoryQuery : allTimeCategoryQuery;

	// Use category-specific entries if available, otherwise use initial entries (total)
	const entries =
		selectedCategory !== undefined &&
		categoryQuery.data?.success &&
		categoryQuery.data.data
			? categoryQuery.data.data
			: initialEntries;
	const getRankColor = (rank: number, isCurrentUser: boolean) => {
		if (isCurrentUser) return "text-theme"; // Highlight current user
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

	// Find current user's position
	const currentUserRank =
		entries.findIndex((entry) => entry.userId === currentUserId) + 1;

	return (
		<div className={`p-4`}>
			<div className="border-b border-theme pb-2 mb-3">
				<h3 className="text-theme text-4xl">Rankings</h3>
				<div className="text-white-400 text-lg">
					{entries.length} player(s){" "}
					{mode === "live"
						? "currently playing"
						: "on all-time leaderboard"}
					{currentUserRank > 0 && (
						<span className="text-theme ml-2">
							• You're #{currentUserRank}
						</span>
					)}
				</div>
			</div>

			{/* Mode Toggle */}
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => setMode("live")}
					className={clsx(
						"px-4 py-2 border transition-colors",
						mode === "live"
							? "bg-theme border-theme text-white"
							: "bg-transparent border-gray-600 text-gray-400 hover:border-theme hover:text-white"
					)}
				>
					🔴 Live Rankings
				</button>
				<button
					onClick={() => setMode("all-time")}
					className={clsx(
						"px-4 py-2 border transition-colors",
						mode === "all-time"
							? "bg-theme border-theme text-white"
							: "bg-transparent border-gray-600 text-gray-400 hover:border-theme hover:text-white"
					)}
				>
					🏆 All-Time Best
				</button>
			</div>

			<nav className="flex flex-wrap gap-1 mb-2">
				{CATEGORIES.map((category) => {
					const isSelected = selectedCategory === category.code;
					const isLoading =
						selectedCategory === category.code &&
						categoryQuery.isLoading;

					return (
						<button
							key={category.code}
							onClick={() => setSelectedCategory(category.code)}
							disabled={isLoading}
							className={clsx(
								"p-2 text-md border transition-colors text-white",
								isSelected
									? "bg-theme border-theme"
									: "bg-transparent border-gray-600 hover:border-red-500 hover:text-red-300",
								isLoading
									? "opacity-50 cursor-not-allowed"
									: "cursor-pointer"
							)}
						>
							{isLoading ? "..." : `[ ${category.name} ]`}
						</button>
					);
				})}
			</nav>

			<div>
				<header className="grid grid-cols-[50px_3fr_1fr_1fr_1fr_1fr] gap-4">
					<div>Rank</div>
					<div>Player</div>
					<div>Coverage</div>
					<div className="text-orange-400">Best Streak</div>
					<div>Polls Answered</div>
					<div>Run</div>
				</header>
				{entries.map((entry, index) => {
					const rank = index + 1;
					const isCurrentUser = entry.userId === currentUserId;

					const currentRun = entry.runId;

					return (
						<div
							key={`${entry.userId}-${entry.runId ?? index}`}
							className={clsx(
								"grid grid-cols-[50px_3fr_1fr_1fr_1fr_1fr] gap-4",
								isCurrentUser && "bg-gray-800 py-2"
							)}
						>
							<div
								className={clsx(
									getRankColor(rank, isCurrentUser),
									"ml-2"
								)}
							>
								#{rank}
							</div>
							<div
								className={
									isCurrentUser ? "text-theme" : "text-white"
								}
							>
								{entry.displayName || "Anonymous"}
								{isCurrentUser && (
									<span className="text-theme text-xs ml-1">
										(you)
									</span>
								)}
							</div>
							<div className="text-white">
								{entry.totalCoverage}%
							</div>
							<div className="text-orange-400">
								🔥{entry.bestStreak}
							</div>
							<div className="text-white">
								{entry.pollsAnswered}
							</div>
							<div>#{currentRun ?? "-"}</div>
						</div>
					);
				})}
			</div>

			{entries.length === 0 && (
				<div className="text-white text-center py-4">
					No active players right now
				</div>
			)}
			{/*
			<footer className="border-t border-theme pt-2 mt-3">
				<p className="text-white text-xs">
					🔥 Best Streak • p = polls answered
				</p>
			</footer> */}
		</div>
	);
};
