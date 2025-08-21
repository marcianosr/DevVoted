import type { RunCategoryXp } from "../models/runCategoryXp";
import { getCategoryMetadata, CATEGORY_CODES, type CategoryCode } from "~/domains/shared/categories";

type CategoryProgressDisplayProps = {
	categoryXp: RunCategoryXp[];
	totalXp?: number;
	className?: string;
};

export const CategoryProgressDisplay = ({ 
	categoryXp, 
	totalXp,
	className = "" 
}: CategoryProgressDisplayProps) => {
	const getCategoryDisplay = (categoryCode: CategoryCode) => {
		const metadata = getCategoryMetadata(categoryCode);
		const xpData = categoryXp.find(xp => xp.categoryCode === categoryCode);
		
		return {
			name: metadata.name,
			currentXp: xpData?.currentXp ?? 0,
			currentStreak: xpData?.currentStreak ?? 0,
			bestStreak: xpData?.bestStreak ?? 0,
			pollsAnswered: xpData?.pollsAnswered ?? 0,
		};
	};

	const categories = CATEGORY_CODES;
	const totalPollsAnswered = categoryXp.reduce((sum, xp) => sum + xp.pollsAnswered, 0);
	const calculatedTotalXp = categoryXp.reduce((sum, xp) => sum + xp.currentXp, 0);
	const displayTotalXp = totalXp ?? calculatedTotalXp;

	return (
		<div className={`bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm ${className}`}>
			{/* Header */}
			<div className="border-b border-gray-600 pb-2 mb-3">
				<div className="text-white font-bold">Category Progress</div>
				<div className="text-gray-400 text-xs">
					Total: {displayTotalXp} XP • {totalPollsAnswered} polls answered
				</div>
			</div>

			{/* Category Progress */}
			<div className="space-y-2">
				{categories.map((categoryCode) => {
					const category = getCategoryDisplay(categoryCode);
					const hasProgress = category.pollsAnswered > 0;
					const accuracy = category.pollsAnswered > 0 
						? (category.currentXp / category.pollsAnswered).toFixed(1)
						: "0.0";

					return (
						<div key={categoryCode} className="flex items-center justify-between">
							{/* Category name */}
							<div className="flex items-center min-w-0 flex-1">
								<div className={`text-xs font-bold w-12 ${hasProgress ? 'text-blue-400' : 'text-gray-500'}`}>
									{category.name.slice(0, 4).toUpperCase()}
								</div>
								<div className={`text-xs ml-2 ${hasProgress ? 'text-white' : 'text-gray-500'}`}>
									{category.currentXp} XP
								</div>
							</div>

							{/* Progress indicators */}
							<div className="flex items-center space-x-2 text-xs">
								{/* Accuracy */}
								<div className={`${hasProgress ? 'text-green-400' : 'text-gray-500'}`}>
									{accuracy}
								</div>
								
								{/* Current streak */}
								{category.currentStreak > 0 && (
									<div className="text-yellow-400">
										🔥{category.currentStreak}
									</div>
								)}

								{/* Best streak indicator */}
								{category.bestStreak > 2 && (
									<div className="text-orange-400 text-xs">
										↑{category.bestStreak}
									</div>
								)}

								{/* Polls answered */}
								<div className="text-gray-400 min-w-[2rem] text-right">
									{category.pollsAnswered}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer */}
			<div className="border-t border-gray-600 pt-2 mt-3">
				<div className="text-gray-400 text-xs">
					🔥 Current Streak • ↑ Best Streak • Accuracy per poll
				</div>
			</div>
		</div>
	);
};