import type { ThresholdInfo } from "~/domains/userPerformance/services/thresholdCalculator.service";

type ThresholdDisplayProps = {
	thresholdInfo: ThresholdInfo;
};

export const ThresholdDisplay = ({ thresholdInfo }: ThresholdDisplayProps) => {
	return (
		<div className="mb-4 p-3 border border-white">
			<div className="flex items-center justify-between">
				<div>
					<div className="font-medium text-white">
						Set {thresholdInfo.currentSet} Threshold
					</div>
					<div className="text-sm text-white">
						{thresholdInfo.currentXp} / {thresholdInfo.requiredXp}{" "}
						XP total for this set
					</div>
				</div>
				<div className="text-right">
					{thresholdInfo.isThresholdCheckPoll ? (
						// This is a threshold check poll (3rd poll in set)
						thresholdInfo.meetsThreshold && (
							<span className="text-green-600 font-medium">
								✅ Set Complete!
							</span>
						)
					) : // Not a threshold check poll yet
					thresholdInfo.meetsThreshold ? (
						<span className="text-green-600 font-medium">
							✅ On Track
						</span>
					) : (
						<span className="text-orange-600 font-medium">
							⚠️ Need{" "}
							{thresholdInfo.requiredXp - thresholdInfo.currentXp}{" "}
							more XP
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
