import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { aggregateRunCategoryXp } from "~/domains/runs/utils/xpCalculations";

type CategoryXpGridProps = {
	categoryXp: RunCategoryXp[];
};

export const CategoryXpGrid: React.FC<CategoryXpGridProps> = ({
	categoryXp,
}) => {
	const { totalXp, totalPollsAnswered } = aggregateRunCategoryXp(categoryXp);

	return (
		<>
			<div className="grid grid-cols-3 gap-2 text-sm border-b border-saffron pb-2 mb-2">
				<span>Category</span>
				<span>XP</span>
				<span>Streak</span>
			</div>

			{categoryXp.map((xp: RunCategoryXp) => (
				<ul className="grid grid-cols-3 gap-2 text-sm">
					<li key="categoryCode">
						{CATEGORY_METADATA[xp.categoryCode].name}
					</li>
					<li key="currentXp">{xp.currentXp} XP</li>
					<li key="currentStreak" className="flex gap-2">
						{xp.currentStreak}
						{xp.bestStreak > 0 && <span>🌟</span>}
					</li>
				</ul>
			))}
			<div className="mt-4 pt-4 border-t-1 border-saffron">
				Total: {totalXp} XP • {totalPollsAnswered} polls answered
			</div>
		</>
	);
};
