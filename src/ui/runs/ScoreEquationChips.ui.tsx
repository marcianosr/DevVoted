import { Fragment, type ReactNode } from "react";

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
	chip?: ReactNode;
};

type ScoreEquationChipsProps = {
	isCorrect: boolean;
	baseCoverage: number;
	bonuses: ScoreBonusRow[];
	earnedCoverage: number;
	animated?: boolean;
	startDelayMs?: number;
};

const CHIP_STAGGER_MS = 110;

const formatDelta = (value: number): string =>
	`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export const totalTone = (isCorrect: boolean): string =>
	isCorrect ? "text-green-400" : "text-red-400";

const chipTone = (value: number): string => {
	if (value > 0) return "border-green-400/50 text-green-400";
	if (value < 0) return "border-red-400/50 text-red-400";
	return "border-zinc-700 text-zinc-400";
};

const valueTone = (value: number): string => {
	if (value > 0) return "text-green-400";
	if (value < 0) return "text-red-400";
	return "text-zinc-400";
};

export const ScoreEquationChips = ({
	isCorrect,
	baseCoverage,
	bonuses,
	earnedCoverage,
	animated = false,
	startDelayMs = 0,
}: ScoreEquationChipsProps) => {
	const modifiers: ScoreBonusRow[] = [
		{ label: baseCoverage >= 0 ? "correct" : "wrong", value: baseCoverage },
		...bonuses,
	];

	const popAt = (step: number) =>
		animated
			? {
					className: "reveal-pop",
					style: {
						animationDelay: `${startDelayMs + step * CHIP_STAGGER_MS}ms`,
					},
				}
			: { className: "", style: undefined };

	const totalStep = modifiers.length;

	if (modifiers.length <= 1) {
		const total = popAt(1);
		return (
			<div className="pb-2">
				<div className="flex items-baseline justify-between">
					<span className="text-zinc-400">
						{isCorrect ? "Correct answer" : "Wrong answer"}
					</span>
					<span
						className={clsx(
							"inline-block text-xl font-bold tabular-nums",
							totalTone(isCorrect),
							total.className
						)}
						style={total.style}
					>
						{formatDelta(earnedCoverage)}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="pb-2">
			<div className="flex items-center gap-2 flex-wrap">
				{modifiers.map((modifier, index) => {
					const pop = popAt(index);
					return (
						<Fragment key={`${modifier.label}-${index}`}>
							{index > 0 && (
								<span
									className={clsx("inline-block text-white", pop.className)}
									style={pop.style}
								>
									+
								</span>
							)}
							{modifier.chip ? (
								<span
									className={clsx(
										"inline-flex items-center gap-1.5",
										pop.className
									)}
									style={pop.style}
								>
									<span
										className={clsx(
											"font-bold tabular-nums",
											valueTone(modifier.value)
										)}
									>
										{formatDelta(modifier.value)}
									</span>
									{modifier.chip}
								</span>
							) : modifier.rarity ? (
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
											RARITY_COLORS[modifier.rarity].text,
											pop.className
										)}
										style={pop.style}
									>
										<span className="font-bold tabular-nums">
											{formatDelta(modifier.value)}
										</span>
										<span className="text-xs opacity-80">{modifier.label}</span>
									</span>
								</Popover>
							) : (
								<span
									className={clsx(
										"inline-flex items-baseline gap-1.5 border px-2 py-1",
										chipTone(modifier.value),
										pop.className
									)}
									style={pop.style}
								>
									<span className="font-bold tabular-nums">
										{formatDelta(modifier.value)}
									</span>
									<span className="text-xs opacity-70">{modifier.label}</span>
								</span>
							)}
						</Fragment>
					);
				})}
				<span
					className={clsx("text-zinc-500", popAt(totalStep).className)}
					style={popAt(totalStep).style}
				>
					=
				</span>
				<span
					className={clsx(
						"inline-block text-xl font-extrabold tabular-nums",
						totalTone(isCorrect),
						popAt(totalStep).className
					)}
					style={popAt(totalStep).style}
				>
					{formatDelta(earnedCoverage)}
				</span>
			</div>
		</div>
	);
};
