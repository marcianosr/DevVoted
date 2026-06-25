import { useState } from "react";

import { clsx } from "clsx";

export type LeaderboardPlayerDisplay = {
	userId: string;
	displayName: string;
	role?: string;
	photoUrl: string;
	displayCoverage: number;
	level: number;
	gateNumber: number;
	totalCoverage: number;
	bestStreak: number;
	currentStreak: number | null;
	correctPolls: number;
};

const sortOptions = [
	{ value: "coverage", label: "Coverage" },
	{ value: "gate-number", label: "Gate Number" },
	{ value: "best-streak", label: "Best Streak" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const sortFns: Record<
	SortOption,
	(a: LeaderboardPlayerDisplay, b: LeaderboardPlayerDisplay) => number
> = {
	coverage: (a, b) => b.totalCoverage - a.totalCoverage,
	"gate-number": (a, b) => b.gateNumber - a.gateNumber,
	"best-streak": (a, b) => b.bestStreak - a.bestStreak,
};

type LeaderboardUIProps = {
	entries: LeaderboardPlayerDisplay[];
	categoryName: string;
	isLoading: boolean;
	isError: boolean;
};

export const LeaderboardUI = ({
	entries,
	categoryName,
	isLoading,
	isError,
}: LeaderboardUIProps) => {
	const [sortOption, setSortOption] = useState<SortOption>("coverage");

	if (isLoading) return <p className="text-white">Loading leaderboard</p>;
	if (isError)
		return <p className="text-red-500">Failed to load leaderboard</p>;

	const sorted = [...entries].sort(sortFns[sortOption]);

	return (
		<section>
			<header className="mb-6 mt-8">
				<h2 className="text-3xl text-theme">
					{categoryName} category rankings
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
				{sorted.map((entry, idx) => {
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
								<span>Gate {entry.gateNumber}</span>
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
										{ "prismatic-text": isFirstPlace }
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
									src={entry.photoUrl}
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
								{entry.level > 1 && (
									<span className="text-rose-500">[L{entry.level}]</span>
								)}
								<p className="text-2xl flex gap-2 items-center">
									{entry.displayCoverage}%{" "}
									<span className="text-sm">coverage</span>
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
