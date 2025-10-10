import type { Run } from "~/domains/runs/models/run";
import { CategoryXpGrid } from "./CategoryXpGrid";

interface RunStatusDisplayProps {
	activeRun: Run | null;
}

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
}) => {
	if (!activeRun) return null;

	return (
		<div>
			<h3 className="text-lg font-semibold text-saffron mb-2">
				Run info
			</h3>

			<div className="text-xs text-white mb-4">
				Started: {new Date(activeRun.startedAt).toLocaleString()}
			</div>

			{activeRun.categoryXp && (
				<CategoryXpGrid categoryXp={activeRun.categoryXp} />
			)}
		</div>
	);
};
