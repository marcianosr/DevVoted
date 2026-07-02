import { Fragment } from "react";

import { clsx } from "clsx";

import { ConfigCard } from "~/ui/economy/ConfigCard.ui";
import { Popover } from "~/ui/Popover.component";
import { RARITY_COLORS } from "~/ui/rarityColors";
import type { Rarity } from "~/ui/rarityColors";

export type ScoreBonusRow = {
	label: string;
	value: number;
	rarity?: Rarity;
	description?: string;
};

export type PollScoreSummaryData = {
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

type PollScoreSummaryProps = PollScoreSummaryData & {
	categoryName: string;
};

const formatDelta = (value: number): string =>
	`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const totalTone = (isCorrect: boolean) =>
	isCorrect ? "text-green-400" : "text-red-400";

const chipTone = (value: number) =>
	value > 0
		? "border-green-400/50 text-green-400"
		: value < 0
			? "border-red-400/50 text-red-400"
			: "border-zinc-700 text-zinc-400";

/**
 * The score card shown beside the answer review: how this poll's coverage was
 * earned expressed as a one-line chip equation (base answer + each active
 * modifier = total), the resulting category coverage with a progress bar, and a
 * compact stats line. No surrounding box — flat rows separated by rules.
 */
export const PollScoreSummary = ({
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
}: PollScoreSummaryProps) => {
	// Coverage can be negative or exceed 100% (levels); the bar shows progress
	// toward the next 100% level.
	const coverageFill = Math.max(0, Math.min(100, newTotalCoverage));
	const modifiers = [
		{ label: baseCoverage >= 0 ? "correct" : "wrong", value: baseCoverage },
		...bonuses,
	];

	return (
		<div className="text-sm">
			<div className="flex items-center gap-2 pb-2">
				<span className="inline-block w-2 h-2 bg-theme" />
				<span className="text-sm text-white">
					Poll score for <span className="text-theme">{categoryName}</span>
				</span>
			</div>

			<div className="border-t border-theme py-2">
				{modifiers.length > 1 ? (
					<div className="flex items-center gap-2 flex-wrap">
						{modifiers.map((modifier, index) => (
							<Fragment key={`${modifier.label}-${index}`}>
								{index > 0 && <span className="text-white">+</span>}
								{modifier.rarity ? (
									<Popover
										ariaLabel={`${modifier.label} config details`}
										content={
											<ConfigCard
												size="large"
												name={modifier.label}
												rarity={modifier.rarity}
												description={modifier.description}
											/>
										}
									>
										<span
											className={clsx(
												"inline-flex items-baseline gap-1.5 border px-2 py-1",
												RARITY_COLORS[modifier.rarity].border,
												RARITY_COLORS[modifier.rarity].bg,
												RARITY_COLORS[modifier.rarity].text
											)}
										>
											<span className="font-bold tabular-nums">
												{formatDelta(modifier.value)}
											</span>
											<span className="text-xs opacity-80">
												{modifier.label}
											</span>
										</span>
									</Popover>
								) : (
									<span
										className={clsx(
											"inline-flex items-baseline gap-1.5 border px-2 py-1",
											chipTone(modifier.value)
										)}
									>
										<span className="font-bold tabular-nums">
											{formatDelta(modifier.value)}
										</span>
										<span className="text-xs opacity-70">{modifier.label}</span>
									</span>
								)}
							</Fragment>
						))}
						<span className="text-zinc-500">=</span>
						<span
							className={clsx(
								"text-xl font-bold tabular-nums",
								totalTone(isCorrect)
							)}
						>
							{formatDelta(earnedCoverage)}
						</span>
					</div>
				) : (
					<div className="flex items-baseline justify-between">
						<span className="text-zinc-400">
							{isCorrect ? "Correct answer" : "Wrong answer"}
						</span>
						<span
							className={clsx(
								"text-xl font-bold tabular-nums",
								totalTone(isCorrect)
							)}
						>
							{formatDelta(earnedCoverage)}
						</span>
					</div>
				)}
			</div>

			<div className="border-t border-theme pt-2">
				<div className="flex items-baseline justify-between">
					<p className="text-theme">{categoryName} coverage</p>
					<p>
						<span className="text-zinc-400">
							{previousCoverage.toFixed(1)}%
						</span>
						<span className="text-zinc-500 mx-1">→</span>
						<span className={totalTone(isCorrect)}>
							{newTotalCoverage.toFixed(1)}%
						</span>
					</p>
				</div>
				<div className="mt-1 h-2 bg-zinc-800 overflow-hidden">
					<div
						className={clsx(
							"h-full transition-all duration-500",
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
