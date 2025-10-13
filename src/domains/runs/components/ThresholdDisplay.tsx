import type { ThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";

type ThresholdDisplayProps = {
	thresholdInfo: ThresholdInfo;
};

export const ThresholdDisplay = ({ thresholdInfo }: ThresholdDisplayProps) => {
	return (
		<div className="mb-4 p-3 border border-white">
			<div className="flex items-center justify-between">
				<div>
					<div className="font-medium text-white">
						Round {thresholdInfo.currentRound} Threshold
					</div>
					<div className="text-sm text-white">
						{thresholdInfo.maxCoverage}% /{" "}
						{thresholdInfo.requiredCoverage}% coverage required
					</div>
				</div>
				<div className="text-right">
					{thresholdInfo.meetsThreshold ? (
						<span className="text-green-400 font-medium">
							✅ On Track
						</span>
					) : (
						<span className="text-orange-400 font-medium">
							⚠️ Need{" "}
							{thresholdInfo.requiredCoverage -
								thresholdInfo.maxCoverage}
							% more
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
