interface RunEndStatsProps {
	totalXp: number;
	totalPollsAnswered: number;
	categoryXp: {
		categoryCode: string;
		currentXp: number;
		currentStreak: number;
		bestStreak: number;
		pollsAnswered: number;
	}[];
	duration: string;
	reason?: string;
}

export const RunEndStats = ({
	totalXp,
	totalPollsAnswered,
	categoryXp,
	duration,
	reason,
}: RunEndStatsProps) => {
	const getReasonText = (reason?: string) => {
		switch (reason) {
			case "threshold_not_met":
				return "Threshold not met";
			case "wrong_answer":
				return "Wrong answer";
			default:
				return "Game completed";
		}
	};

	const getReasonEmoji = (reason?: string) => {
		switch (reason) {
			case "threshold_not_met":
				return "⚠️";
			case "wrong_answer":
				return "❌";
			default:
				return "🏆";
		}
	};

	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			<div className="text-center space-y-2">
				<div className="text-6xl">{getReasonEmoji(reason)}</div>
				<h2 className="text-2xl font-bold">{getReasonText(reason)}</h2>
				<p className="text-gray-600">Duration: {duration}</p>
			</div>

			<div className="bg-gray-100 rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">Run Summary</h3>
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center">
						<div className="text-3xl font-bold text-blue-600">{totalXp}</div>
						<div className="text-sm text-gray-600">Total XP Earned</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-green-600">
							{totalPollsAnswered}
						</div>
						<div className="text-sm text-gray-600">Questions Answered</div>
					</div>
				</div>
			</div>

			<div className="bg-gray-100 rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">Category Performance</h3>
				<div className="space-y-3">
					{categoryXp.map((category) => (
						<div
							key={category.categoryCode}
							className="flex items-center justify-between p-3 bg-white rounded border"
						>
							<div>
								<div className="font-medium capitalize">
									{category.categoryCode}
								</div>
								<div className="text-sm text-gray-600">
									{category.pollsAnswered} questions • Best streak:{" "}
									{category.bestStreak}
								</div>
							</div>
							<div className="text-right">
								<div className="font-bold text-lg">{category.currentXp} XP</div>
								<div className="text-sm text-gray-600">
									Streak: {category.currentStreak}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};