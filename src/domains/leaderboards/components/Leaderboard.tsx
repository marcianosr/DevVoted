import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

import { getChallengeModeOrDefault } from "~/domains/runs/data/challengeModes";
import { getCurrentGate } from "~/domains/runs/services/thresholdCalculator.service";
import { calculateLevelAndCoverage } from "~/domains/runs/utils/levelCalculations";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";

import { getLeaderboard } from "../api/leaderboards";

type LeaderboardProps = {
	categoryCode: CategoryCode;
};

const getPlayerGateNumber = (
	pollsSeen: number,
	challengeModeId: string | null
): number => {
	const mode = getChallengeModeOrDefault(challengeModeId ?? "vanilla");
	const gates = mode.gates;
	const currentGate = getCurrentGate(pollsSeen, gates);
	return currentGate.gate;
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
			</header>
			<ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
				{data.data.map((entry, idx) => {
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
								<span>
									Gate{" "}
									{getPlayerGateNumber(entry.pollsSeen, entry.challengeModeId)}{" "}
									<small className="text-gray-300 text-xs block">
										({entry.challengeModeId ?? "vanilla"})
									</small>
								</span>
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
									"border-b-prismatic": isFirstPlace,
									"border-theme": !isFirstPlace,
								})}
							>
								<img
									src={entry.photoUrl || ""}
									alt={`photo of ${entry.displayName}`}
									className="w-16 h-16 mb-2"
								/>
							</section>
							<section
								className={clsx("border-b text-sm flex gap-2 py-2", {
									"border-b-prismatic": isFirstPlace,
									"border-theme": !isFirstPlace,
								})}
							>
								{level > 1 && (
									<>
										<span className="text-rose-500">[L{level})]</span>
									</>
								)}
								<p className="text-xl flex gap-2 items-center">
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
