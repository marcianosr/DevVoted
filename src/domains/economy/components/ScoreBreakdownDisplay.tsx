import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { Config } from "~/domains/configs/models/config";
import { configs } from "~/domains/configs/data/configs";

type ScoreBreakdownDisplayProps = {
	breakdown: PollScoreBreakdown | null;
	activeConfigIds: string[];
	categoryCode: string;
};

export const ScoreBreakdownDisplay = ({
	breakdown,
	activeConfigIds,
	categoryCode,
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
		return hasStreakEffect && targetsCategory || hasRandomEffect;
	});

	const baseAmp = 1 + 0.1 * breakdown.streak;
	const configAmpBonus = breakdown.amp - baseAmp;
	const hasRelevantConfigBonus = relevantConfigs.length > 0 && Math.abs(configAmpBonus) > 0.01;

	return (
		<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
			<h3 className="text-lg font-semibold text-gray-900 mb-3">
				XP Breakdown - Round {breakdown.round}
			</h3>

			<div className="space-y-2">
				{/* Base score */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Base XP (Round × 10)</span>
					<span className="font-mono font-medium">{breakdown.base} XP</span>
				</div>

				{/* Streak amplifier */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						Streak Bonus ({breakdown.streak} correct)
					</span>
					<span className="font-mono font-medium">
						×{baseAmp.toFixed(1)}
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
											? configAmpBonus > 0
												? "text-green-600"
												: "text-red-600"
											: "text-indigo-600"
									}`}
								>
									{configAmpBonus > 0 ? "+" : ""}
									{configAmpBonus.toFixed(1)} amp
								</span>
							</div>
						))}
					</div>
				)}

				{/* Total amplifier */}
				<div className="border-t pt-2 mt-2">
					<div className="flex justify-between items-center font-medium">
						<span className="text-gray-700">Total Amplifier</span>
						<span className="font-mono text-indigo-600">
							×{breakdown.amp.toFixed(1)}
						</span>
					</div>
				</div>

				{/* Pre-correctness calculation */}
				<div className="border-t pt-2 mt-2">
					<div className="flex justify-between items-center">
						<span className="text-gray-600 text-sm">
							Pre-correctness: {breakdown.base} × {breakdown.amp.toFixed(1)}
						</span>
						<span className="font-mono text-sm text-gray-500">
							= {Math.round(breakdown.base * breakdown.amp)} XP
						</span>
					</div>
				</div>

				{/* Correctness factor note */}
				<div className="border-t pt-2 mt-2">
					<div className="flex justify-between items-center">
						<span className="text-gray-600 text-sm">
							Correctness factor applied
						</span>
						<span className="font-mono text-sm text-gray-500">
							(varies by answer quality)
						</span>
					</div>
				</div>

				{/* Final earned XP */}
				<div className="bg-indigo-100 rounded-md p-3 mt-3">
					<div className="flex justify-between items-center">
						<span className="font-semibold text-indigo-900">
							Final XP Earned
						</span>
						<span className="font-mono font-bold text-xl text-indigo-700">
							{breakdown.earnedXP} XP
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};