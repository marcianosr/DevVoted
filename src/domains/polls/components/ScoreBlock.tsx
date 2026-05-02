import { clsx } from "clsx";

import { configs } from "~/domains/configs/data/configs";
import type { ScoreCalculation } from "~/domains/score/services/score.service";

type PerConfigEffect = {
	configId: string;
	coverageAdd: number;
	coverageMult: number;
};

type ScoreBlockProps = {
	score: ScoreCalculation;
	perConfigCoverageEffects?: PerConfigEffect[];
};

type BreakdownRowProps = {
	label: string;
	sublabel?: string;
	value: number;
	hideIfZero?: boolean;
};

const formatValue = (value: number): string => {
	const sign = value >= 0 ? "+" : "";
	return `${sign}${value.toFixed(1)}%`;
};

const valueColor = (value: number) =>
	clsx(
		value > 0 && "text-green-400",
		value < 0 && "text-red-400",
		value === 0 && "text-zinc-500"
	);

const BreakdownRow = ({
	label,
	sublabel,
	value,
	hideIfZero = false,
}: BreakdownRowProps) => {
	if (hideIfZero && value === 0) return null;

	return (
		<div className="flex items-center gap-3 py-2">
			<div className="flex-1 min-w-0">
				<p className="text-xl">{label}</p>
				{sublabel && <p className="text-zinc-400">{sublabel}</p>}
			</div>
			<span className={clsx("text-xl", valueColor(value))}>
				{formatValue(value)}
			</span>
		</div>
	);
};

const resolveConfigContribution = (
	effect: PerConfigEffect,
	coverageBeforeConfigs: number
): number => {
	const multContribution = coverageBeforeConfigs * (effect.coverageMult - 1);
	return Math.round((multContribution + effect.coverageAdd) * 10) / 10;
};

export const ScoreBlock = ({
	score,
	perConfigCoverageEffects = [],
}: ScoreBlockProps) => {
	const { breakdown, newStreak } = score;
	const isCorrect = breakdown.earnedCoverage > 0;
	const streakBroken = newStreak === 0;
	const baseScore = isCorrect
		? breakdown.baseCoverage
		: breakdown.earnedCoverage - breakdown.configBonus;
	const coverageBeforeConfigs =
		breakdown.earnedCoverage - breakdown.configBonus;
	const prevCoverage =
		Math.round((score.newTotalCoverage - breakdown.earnedCoverage) * 10) / 10;

	const hasModifiers =
		perConfigCoverageEffects.length > 0 || breakdown.streakBonus !== 0;

	return (
		<div className="border border-theme p-2">
			<BreakdownRow
				label={isCorrect ? "Correct answer" : "Wrong answer"}
				sublabel="base coverage"
				value={baseScore}
			/>

			{hasModifiers && (
				<div className="border-t border-theme pt-2">
					<p className="text-xl pb-1">Modifiers</p>
					{perConfigCoverageEffects.map((effect) => {
						const name =
							configs.find((c) => c.id === effect.configId)?.name ??
							effect.configId;
						const value = resolveConfigContribution(
							effect,
							coverageBeforeConfigs
						);
						return (
							<div key={effect.configId} className="flex items-center py-1">
								<p className="flex-1 text-base">{name}</p>
								<span className={clsx("text-base", valueColor(value))}>
									{formatValue(value)}
								</span>
							</div>
						);
					})}
					{breakdown.streakBonus !== 0 && (
						<div className="flex items-center py-1">
							<p className="flex-1 text-base">
								{streakBroken ? "Streak · broken" : `Streak · ${newStreak}×`}
							</p>
							<span
								className={clsx("text-base", valueColor(breakdown.streakBonus))}
							>
								{formatValue(breakdown.streakBonus)}
							</span>
						</div>
					)}
				</div>
			)}

			<div className="flex items-center gap-3 border-t border-theme pt-3 pb-2 mt-2">
				<p className="flex-1 text-xl">Total</p>
				<span
					className={clsx(
						"text-2xl font-bold",
						isCorrect ? "text-green-400" : "text-red-400"
					)}
				>
					{formatValue(breakdown.earnedCoverage)}
				</span>
			</div>

			<div className="pt-3 space-y-1">
				<div className="flex items-baseline justify-between">
					<p className="text-zinc-400">Category coverage</p>
					<p>
						<span className="text-zinc-400">{prevCoverage.toFixed(1)}%</span>
						<span className="text-zinc-500 mx-1">→</span>
						<span className={isCorrect ? "text-green-400" : "text-red-400"}>
							{score.newTotalCoverage.toFixed(1)}%
						</span>
					</p>
				</div>
				<div className="flex items-baseline justify-between">
					<p className="text-zinc-400">Best streak</p>
					<p>{score.newBestStreak}×</p>
				</div>
				<div className="flex items-baseline justify-between">
					<p className="text-zinc-400">Polls answered</p>
					<p>{score.newPollsAnswered}</p>
				</div>
			</div>
		</div>
	);
};
