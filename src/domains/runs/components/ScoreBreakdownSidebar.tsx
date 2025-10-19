import type { PollScoreBreakdown } from "~/domains/score/services/score.service";
import clsx from "clsx";

type ScoreBreakdownSidebarProps = {
	breakdown: PollScoreBreakdown | null;
	coverageBonus?: number; // From config effects renderProps
};

export const ScoreBreakdownSidebar: React.FC<ScoreBreakdownSidebarProps> = ({
	breakdown,
	coverageBonus = 0,
}) => {
	if (!breakdown) return null;

	const { streak, earnedCoverage } = breakdown;
	const isWrongAnswer = earnedCoverage < 0;

	return (
		<div className={clsx(
			"border p-4 rounded",
			{
				"border-red-500 bg-red-900/20": isWrongAnswer,
				"border-saffron bg-gray-900/50": !isWrongAnswer,
			}
		)}>
			<h3 className={clsx(
				"text-lg font-semibold mb-3",
				{
					"text-red-400": isWrongAnswer,
					"text-saffron": !isWrongAnswer,
				}
			)}>
				Score Breakdown
			</h3>

			{isWrongAnswer ? (
				<>
					<div className="text-red-400">Wrong Answer Penalty</div>
					<div className="border-t border-red-500/50 pt-2 mt-2">
						<div className="text-lg font-bold text-red-400">
							{earnedCoverage.toFixed(1)}% coverage
						</div>
					</div>
				</>
			) : (
				<>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-400">Streak:</span>
							<span className="text-white">{streak} correct</span>
						</div>

						{coverageBonus !== 0 && (
							<div className="flex justify-between">
								<span className="text-gray-400">Config Bonus:</span>
								<span className={clsx({
									"text-green-400": coverageBonus > 0,
									"text-red-400": coverageBonus < 0,
								})}>
									{coverageBonus > 0 ? "+" : ""}{coverageBonus.toFixed(1)}%
								</span>
							</div>
						)}
					</div>

					<div className="border-t border-saffron/50 pt-2 mt-2">
						<div className="text-lg font-bold text-saffron">
							Earned: +{earnedCoverage.toFixed(1)}% coverage
						</div>
					</div>
				</>
			)}
		</div>
	);
};