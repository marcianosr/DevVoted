import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { Config } from "~/domains/configs/models/config";
import { configs } from "~/domains/configs/data/configs";
import { formatCoverage } from "~/domains/score/services/score.service";

type ScoreBreakdownDisplayProps = {
	breakdown: PollScoreBreakdown | null;
	activeConfigIds: string[];
	categoryCode: string;
	coverageBonus?: number; // Coverage bonus from configs (passed from renderProps)
};

export const ScoreBreakdownDisplay = ({
	breakdown,
	activeConfigIds,
	categoryCode,
	coverageBonus = 0,
}: ScoreBreakdownDisplayProps) => {
	if (!breakdown) return null;

	const activeConfigs = activeConfigIds
		.map((id) => configs.find((c) => c.id === id))
		.filter((c): c is Config => !!c);

	const relevantConfigs = activeConfigs.filter((config) => {
		const hasStreakEffect = config.effect.includes("streakAmp");
		const hasRandomEffect = config.effect.includes("randomStreakAmp");
		const targetsCategory =
			config.targetCategories?.includes(categoryCode) ?? false;
		return (hasStreakEffect && targetsCategory) || hasRandomEffect;
	});

	const hasRelevantConfigBonus =
		relevantConfigs.length > 0 && Math.abs(coverageBonus) > 0.01;

	return (
		<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
			<h3 className="text-lg font-semibold text-gray-900 mb-3">
				Coverage Breakdown
			</h3>

			<div className="space-y-2">
				{/* Base coverage */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Base Coverage</span>
					<span className="font-mono font-medium">1%</span>
				</div>

				{/* Streak display */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Current Streak</span>
					<span className="font-mono font-medium text-indigo-600">
						{breakdown.streak} correct
					</span>
				</div>

				{/* Config effects */}
				{hasRelevantConfigBonus && (
					<div className="border-t pt-2 mt-2">
						<div className="text-sm font-medium text-indigo-700 mb-1">
							Config Effects Active:
						</div>
						{relevantConfigs.map((config) => (
							<div
								key={config.id}
								className="flex justify-between items-center text-sm"
							>
								<span className="text-gray-600 flex items-center gap-2">
									<span className="inline-block w-2 h-2 bg-indigo-400 rounded-full"></span>
									{config.name}
								</span>
								<span
									className={`font-mono ${
										config.effect.includes("randomStreakAmp")
											? coverageBonus > 0
												? "text-green-600"
												: "text-red-600"
											: "text-indigo-600"
									}`}
								>
									{coverageBonus > 0 ? "+" : ""}
									{coverageBonus.toFixed(1)}%
								</span>
							</div>
						))}
					</div>
				)}

				{/* Correctness factor note */}
				<div className="border-t pt-2 mt-2">
					<div className="flex justify-between items-center">
						<span className="text-gray-600 text-sm">
							Correctness factor
						</span>
						<span className="font-mono text-sm text-gray-500">
							(0-1.5x based on answer quality)
						</span>
					</div>
				</div>

				{/* Final earned coverage */}
				<div className="bg-indigo-100 rounded-md p-3 mt-3">
					<div className="flex justify-between items-center">
						<span className="font-semibold text-indigo-900">
							Coverage Earned
						</span>
						<span className="font-mono font-bold text-xl text-indigo-700">
							{formatCoverage(breakdown.earnedCoverage)}%
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};