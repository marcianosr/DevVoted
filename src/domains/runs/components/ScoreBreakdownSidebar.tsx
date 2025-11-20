import { clsx } from "clsx";

import type { PollScoreBreakdown } from "~/domains/score/services/score.service";

type ScoreBreakdownSidebarProps = {
	breakdown: PollScoreBreakdown | null;
};

export const ScoreBreakdownSidebar: React.FC<ScoreBreakdownSidebarProps> = ({
	breakdown,
}) => {
	if (!breakdown) return null;

	const { streak, earnedCoverage, baseCoverage, streakBonus, configBonus } =
		breakdown;
	const isWrongAnswer = earnedCoverage < 0;

	return (
		<div
			className={clsx("border p-4", {
				"border-red-500 bg-red-900/20": isWrongAnswer,
				"border-theme bg-zinc-900": !isWrongAnswer,
			})}
		>
			<h3
				className={clsx("text-2xl mb-3", {
					"text-red-400": isWrongAnswer,
					"text-theme": !isWrongAnswer,
				})}
			>
				Score Breakdown
			</h3>

			{isWrongAnswer ? (
				<>
					<div className="text-red-400">Wrong Answer Penalty</div>
					<div className="border-t border-red-500/50 pt-2 mt-2">
						<div className="text-lg text-red-400">
							{earnedCoverage.toFixed(1)}% coverage
						</div>
					</div>
				</>
			) : (
				<>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-400">Base Coverage score:</span>
							<span className="text-white">+{baseCoverage.toFixed(1)}%</span>
						</div>

						{streakBonus > 0 && (
							<div className="flex justify-between">
								<span className="text-gray-400">Streak Bonus ({streak}):</span>
								<span className="text-green-400">
									+{streakBonus.toFixed(1)}%
								</span>
							</div>
						)}

						{configBonus !== 0 && (
							<div className="flex justify-between">
								<span className="text-gray-400">Config Effects:</span>
								<span
									className={clsx({
										"text-green-400": configBonus > 0,
										"text-red-400": configBonus < 0,
									})}
								>
									{configBonus > 0 ? "+" : ""}
									{configBonus.toFixed(1)}%
								</span>
							</div>
						)}
					</div>

					<div className="border-t border-theme/50 pt-2 mt-2">
						<div className="text-lg text-theme">
							Earned: +{earnedCoverage.toFixed(1)}% coverage
						</div>
					</div>
				</>
			)}
		</div>
	);
};
