import { clsx } from "clsx";

export type CategoryCoverageEntry = {
	code: string;
	name: string;
	currentCoverage: number;
	currentStreak: number;
	bestStreak: number;
	isBestStreak: boolean;
	isCurrent: boolean;
};

type CategoryCoverageGridUIProps = {
	entries: CategoryCoverageEntry[];
};

export const CategoryCoverageGridUI = ({
	entries,
}: CategoryCoverageGridUIProps) => (
	<div className="space-y-2">
		<h3 className="text-xl">Coverage score overview</h3>

		<div className="grid grid-cols-4 gap-2 text-sm border-b border-theme pb-2">
			<span>Category</span>
			<span>Coverage</span>
			<span>Streak</span>
			<span>Best Streak</span>
		</div>

		<div className="space-y-1">
			{entries.map((entry) => (
				<div
					key={entry.code}
					className={clsx("grid grid-cols-4 gap-2 text-sm pl-2", {
						"bg-theme/10 border-l-4 border-theme": entry.isCurrent,
						"hover:bg-gray-800/50": !entry.isCurrent,
					})}
					aria-current={entry.isCurrent ? "true" : undefined}
				>
					<span
						className={clsx("self-center", { "text-theme": entry.isCurrent })}
					>
						{entry.name}
					</span>
					<div className="flex flex-col gap-0">
						<span className={clsx({ "text-theme": entry.isCurrent })}>
							{entry.currentCoverage.toFixed(1)}%
						</span>
						<meter
							className="w-full h-2"
							min="0"
							max="100"
							value={entry.currentCoverage}
						/>
					</div>
					<span
						className={clsx("self-center", { "text-theme": entry.isCurrent })}
					>
						{entry.currentStreak}
					</span>
					<span
						className={clsx("self-center", { "text-theme": entry.isCurrent })}
					>
						{entry.isBestStreak && entry.bestStreak > 0 && <>★ </>}
						{entry.bestStreak}
					</span>
				</div>
			))}
		</div>
	</div>
);
