import { Run } from "~/domains/runs/models/run";

type ScoreDisplayProps = {
	run: Run;
	category: string;
};

export const ScoreDisplay = ({ run, category }: ScoreDisplayProps) => {
	const scoreFromCurrentCategory = run.categoryXp.find(
		(xp) => xp.categoryCode === category
	);

	return (
		<div>
			5 x ({scoreFromCurrentCategory?.currentStreak} x{" "}
			{scoreFromCurrentCategory?.pollsAnswered || 0})
		</div>
	);
};
