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
				<div key={xp.categoryCode} className="p-3 border border-white">
					<div className="font-medium text-sm text-white">
						{xp.categoryCode}
					</div>
					<div className="text-lg font-bold text-white">
						{xp.currentXp} XP
					</div>
					<div className="text-xs text-white">
						Streak: {xp.currentStreak}
					</div>
					{xp.bestStreak > 0 && (
						<div className="text-xs text-white">
							Best: {xp.bestStreak}
						</div>
					)}
				</div>
			))}
		</div>
	);
};
