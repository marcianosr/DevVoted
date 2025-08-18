import { Run } from "~/domains/runs/models/run";

type ScoreDisplayProps = {
	run: Run;
	category: string;
};

export const ScoreDisplay = ({ run, category }: ScoreDisplayProps) => {
	console.log(run, "run in score display");
	const scoreFromCategory = run.categoryXp.find(
		(xp) => xp.categoryCode === category
	);

	return (
		<div>
			5 x ({scoreFromCategory?.currentStreak} x{" "}
			{scoreFromCategory?.pollsAnswered || 0})
		</div>
	);
};
