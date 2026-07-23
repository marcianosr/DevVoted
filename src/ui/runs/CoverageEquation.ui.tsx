import { clsx } from "clsx";

import { useCountUp } from "~/ui/hooks/useCountUp";
import {
	ScoreEquationChips,
	type ScoreBonusRow,
	totalTone,
} from "~/ui/runs/ScoreEquationChips.ui";

export type { ScoreBonusRow };

export type CoverageEquationData = {
	isCorrect: boolean;
	baseCoverage: number;
	bonuses: ScoreBonusRow[];
	earnedCoverage: number;
	previousCoverage: number;
	newTotalCoverage: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
};

type CoverageEquationProps = CoverageEquationData & {
	categoryName: string;
};

/**
 * How the last answer's coverage was earned — the chip equation (base + each
 * active modifier = total) followed by the category coverage bar animating from
 * the previous total to the new one, and a compact streak line. Heads the
 * /pipelines score view.
 */
export const CoverageEquation = ({
	isCorrect,
	baseCoverage,
	bonuses,
	earnedCoverage,
	previousCoverage,
	newTotalCoverage,
	currentStreak,
	bestStreak,
	pollsAnswered,
	categoryName,
}: CoverageEquationProps) => {
	// Coverage can be negative or exceed 100% (levels); the bar shows progress
	// toward the next 100% level.
	const animatedTotal = useCountUp(newTotalCoverage, {
		from: previousCoverage,
	});
	const coverageFill = Math.max(0, Math.min(100, newTotalCoverage));

	return (
		<div className="text-sm">
			<ScoreEquationChips
				isCorrect={isCorrect}
				baseCoverage={baseCoverage}
				bonuses={bonuses}
				earnedCoverage={earnedCoverage}
			/>

			<div className="border-t border-theme pt-2">
				<div className="flex items-baseline justify-between">
					<p className="text-theme">{categoryName} coverage</p>
					<p>
						<span className="text-zinc-400">
							{previousCoverage.toFixed(1)}%
						</span>
						<span className="text-zinc-500 mx-1">→</span>
						<span className={clsx("tabular-nums", totalTone(isCorrect))}>
							{animatedTotal.toFixed(1)}%
						</span>
					</p>
				</div>
				<div className="mt-1 h-2 bg-zinc-800 overflow-hidden">
					<div
						className={clsx(
							"h-full transition-all duration-700 ease-out",
							isCorrect ? "bg-green-400" : "bg-red-400"
						)}
						style={{ width: `${coverageFill}%` }}
					/>
				</div>
			</div>

			<p className="border-t border-theme mt-2 pt-2 text-theme">
				Streak {currentStreak}× · Best {bestStreak}× · {pollsAnswered} polls
				answered
			</p>
		</div>
	);
};
