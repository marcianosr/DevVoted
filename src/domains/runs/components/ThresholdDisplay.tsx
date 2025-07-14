interface ThresholdInfo {
	pollNumber: number;
	currentXp: number;
	requiredXp: number;
	meetsThreshold: boolean;
}

interface ThresholdDisplayProps {
	thresholdInfo: ThresholdInfo;
}

export const ThresholdDisplay: React.FC<ThresholdDisplayProps> = ({
	thresholdInfo,
}) => {
	return (
		<div className="mb-4 p-3 border border-white">
			<div className="flex items-center justify-between">
				<div>
					<div className="font-medium text-white">
						Poll #{thresholdInfo.pollNumber} Threshold
					</div>
					<div className="text-sm text-white">
						{thresholdInfo.currentXp} / {thresholdInfo.requiredXp}{" "}
						XP
					</div>
				</div>
				<div className="text-right">
					{thresholdInfo.meetsThreshold ? (
						<span className="text-green-600 font-medium">
							✅ Ready to continue
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
