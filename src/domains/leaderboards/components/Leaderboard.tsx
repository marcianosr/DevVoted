import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

import { VANILLA_CI_GATES } from "~/domains/runs/data/gates/vanilla";
import { getCurrentGate } from "~/domains/runs/services/thresholdCalculator.service";
import { calculateLevelAndCoverage } from "~/domains/runs/utils/levelCalculations";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";

import { getLeaderboard } from "../api/leaderboards";

type LeaderboardResponse = Awaited<ReturnType<typeof getLeaderboard>>;
type SuccessResponse = Extract<LeaderboardResponse, { success: true }>;
type LeaderboardEntry = SuccessResponse["data"][number];

type LeaderboardProps = {
	categoryCode: CategoryCode;
};

const getPlayerGateNumber = (pollsSeen: number): number => {
	const currentGate = getCurrentGate(pollsSeen, VANILLA_CI_GATES);
	return currentGate.gate;
};

/**
 * Leaderboard refresh interval (3 minutes)

 * Rationale: Leaderboard queries are expensive (multi-table joins with aggregation).
 * A 3-minute interval reduces database load by 75% compared to 45s while still
 * providing reasonably fresh competitive rankings.
 */
export const LEADERBOARD_REFRESH_INTERVAL = 3 * 60 * 1000;

const sortOptions = [
	{ value: "coverage", label: "Coverage" },
	{ value: "gate-number", label: "Gate Number" },
	{ value: "best-streak", label: "Best Streak" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const sortByCoverage = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
	return [...data].sort((a, b) => b.totalCoverage - a.totalCoverage);
};

const sortyByBestStreak = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
	return [...data].sort((a, b) => b.bestStreak - a.bestStreak);
};

const sortByGateNumber = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
	return [...data].sort((a, b) => {
		const gateA = getPlayerGateNumber(a.pollsSeen);
		const gateB = getPlayerGateNumber(b.pollsSeen);
		return gateB - gateA;
	});
};

const sortMap: Record<
	SortOption,
	(data: LeaderboardEntry[]) => LeaderboardEntry[]
> = {
	coverage: sortByCoverage,
	"gate-number": sortByGateNumber,
	"best-streak": sortyByBestStreak,
};

const Leaderboard = ({ categoryCode }: LeaderboardProps) => {
	const [sortOption, setSortOption] = useState<SortOption>("coverage");
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

	if (isLoading) return <p className="text-white">Loading leaderboard</p>;
	if (error || !data?.success)
		return <p className="text-red-500">Failed to load leaderboard</p>;

	return (
		<section>
			<header className="mb-6 mt-8">
				<h2 className="text-3xl text-theme">
					{getCategoryMetadata(categoryCode).name} category rankings
				</h2>
				<small>This leaderboard reflects your current run only</small>
				<label className="flex items-center gap-2 mt-2">
					<span>Sort by:</span>
					<select
						className="p-2 bg-gray-900 border border-theme"
						value={sortOption}
						onChange={(e) => setSortOption(e.target.value as SortOption)}
					>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>
			</header>
			<ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
				{sortMap[sortOption](data.data).map((entry, idx) => {
					const { displayCoverage, level } = calculateLevelAndCoverage(
						entry.totalCoverage
					);
					const isFirstPlace = idx === 0;

					return (
						<li
							key={entry.userId}
							className={clsx("mb-4 border p-4", {
								"border-prismatic-first": isFirstPlace,
								"border-theme": !isFirstPlace,
							})}
						>
							<header className="flex gap-2 justify-between">
								<span className="text-xl">#{idx + 1}</span>
								<span>Gate {getPlayerGateNumber(entry.pollsSeen)}</span>
							</header>
							<section
								className={clsx("pb-1", {
									"border-b-prismatic": isFirstPlace,
									"border-theme": !isFirstPlace,
								})}
							>
								<h4
									className={clsx(
										"text-2xl text-theme leading-tight wrap-break-word",
										{
											"prismatic-text": isFirstPlace,
										}
									)}
								>
									{entry.displayName}
								</h4>
								{entry.role === "poll-editor" && (
									<small className="text-xs text-gray-400 -mt-1 block">
										{entry.role}
									</small>
								)}
							</section>
							<section
								className={clsx("border-b text-sm flex gap-2 py-2", {
									"border-b-prismatic border-b-4": isFirstPlace,
									"border-theme": !isFirstPlace,
								})}
							>
								<img
									src={entry.photoUrl || ""}
									alt={`photo of ${entry.displayName}`}
									className="w-full mb-2"
								/>
							</section>
							<section
								className={clsx(
									"border-b text-sm gap-2 py-2 flex justify-center",
									{
										"border-b-prismatic border-b-4": isFirstPlace,
										"border-theme": !isFirstPlace,
									}
								)}
							>
								{level > 1 && <span className="text-rose-500">[L{level}]</span>}
								<p className="text-2xl flex gap-2 items-center">
									{displayCoverage}% <span className="text-sm">coverage</span>
								</p>
							</section>
							<section className="text-sm mt-2">
								<p className="text-lg">Run stats</p>
								<ul className="px-4 list-disc">
									<li>correct polls: {entry.correctPolls}</li>
									<li>best streak: {entry.bestStreak}</li>
									<li>current streak: {entry.currentStreak}</li>
								</ul>
							</section>
						</li>
					);
				})}
			</ol>
		</section>
	);
};

export default Leaderboard;
