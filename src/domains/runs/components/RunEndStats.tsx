import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";

export type Reason =
	| "victory"
	| "threshold_not_met"
	| "manual_break_off"
	| "wrong_answer";
type RunEndStatsProps = {
	totalCoverage: number;
	totalPollsAnswered: number;
	categoryCoverage: {
		categoryCode: CategoryCode;
		currentCoverage: number;
		currentStreak: number;
		bestStreak: number;
		pollsAnswered: number;
	}[];
	duration: string;
	reason: Reason;
};

const getReason = (reason: Reason) =>
	({
		victory: {
			text: "You mastered all CI gates in this run!",
			emoji: "🎉",
		},
		threshold_not_met: { text: "CI gate failed!", emoji: "⚠️" },
		manual_break_off: { text: "Manually broke off the run", emoji: "🛑" },
		wrong_answer: { text: "Wrong answer", emoji: "❌" },
	})[reason];

export const RunEndStats = ({
	totalCoverage,
	totalPollsAnswered,
	categoryCoverage,
	duration,
	reason,
}: RunEndStatsProps) => {
	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			<div className="text-center space-y-2">
				<div className="text-6xl">{getReason(reason).emoji}</div>
				<h2 className="text-2xl">{getReason(reason).text}</h2>
				<p className="text-gray-400">Duration: {duration}</p>
			</div>

			<div className="bg-zinc-900 p-6">
				<h3 className="text-lg mb-4">Category Performance</h3>
				<div className="space-y-3">
					{categoryCoverage.map((category) => (
						<div
							key={category.categoryCode}
							className={`flex items-center justify-between p-3 bg-zinc-900 border-${category.categoryCode} border-2`}
						>
							<div>
								<div className="capitalize">
									{
										getCategoryMetadata(
											category.categoryCode
										).name
									}
								</div>
								<div className="text-sm">
									{category.pollsAnswered} questions • Best
									streak: {category.bestStreak}
								</div>
							</div>
							<div className="text-right">
								<div className="text-lg">
									{category.currentCoverage}%
								</div>
								<div className="text-sm">
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
