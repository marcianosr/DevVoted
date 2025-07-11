import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";

interface CategoryXpGridProps {
	categoryXp: RunCategoryXp[];
}

export const CategoryXpGrid: React.FC<CategoryXpGridProps> = ({
	categoryXp,
}) => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
			{categoryXp.map((xp: RunCategoryXp) => (
				<div
					key={xp.categoryCode}
					className="bg-white p-3 rounded border border-blue-100"
				>
					<div className="font-medium text-sm text-blue-900">
						{xp.categoryCode}
					</div>
					<div className="text-lg font-bold text-blue-800">
						{xp.currentXp} XP
					</div>
					<div className="text-xs text-blue-600">
						Streak: {xp.currentStreak}
					</div>
					{xp.bestStreak > 0 && (
						<div className="text-xs text-blue-500">
							Best: {xp.bestStreak}
						</div>
					)}
				</div>
			))}
		</div>
	);
};