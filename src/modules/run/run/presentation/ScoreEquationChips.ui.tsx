import { type CSSProperties, Fragment, type ReactNode } from "react";

import { clsx } from "clsx";

import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type ScoreBonusRow = {
	label: string;
	value: number;
	chip?: ReactNode;
};

/** Why the base ("correct") chip was boosted — surfaced as its hover tooltip. */
export type DifficultyBonus = {
	multiplier: number;
	optionCount: number;
	isMultiple: boolean;
};

type ScoreEquationChipsProps = {
	isCorrect: boolean;
	baseCoverage: number;
	bonuses: ScoreBonusRow[];
	earnedCoverage: number;
	/** When set, the "correct" chip explains its difficulty boost on hover. */
	difficulty?: DifficultyBonus;
	animated?: boolean;
	startDelayMs?: number;
};

const CHIP_STAGGER_MS = 110;

const formatDelta = (value: number): string =>
	`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export const totalTone = (isCorrect: boolean): string =>
	isCorrect ? "text-viridian" : "text-cinnabar";

const chipTone = (value: number): string => {
	if (value > 0) return "border-viridian/50 text-viridian";
	if (value < 0) return "border-cinnabar/50 text-cinnabar";
	return "border-edge-strong text-pewter";
};

const valueTone = (value: number): string => {
	if (value > 0) return "text-viridian";
	if (value < 0) return "text-cinnabar";
	return "text-pewter";
};

// The operators are the equation's scaffolding, so they sit back and let the
// numbers carry the colour. Previously "+" was white and "=" gray, in one line.
const OPERATOR_TONE = "text-pewter";

const difficultyReason = ({
	optionCount,
	isMultiple,
	multiplier,
}: DifficultyBonus): string =>
	`Harder polls pay more coverage — ${optionCount} options${
		isMultiple ? ", multiple-choice" : ""
	} (×${multiplier}).`;

type ChipPop = { className: string; style: CSSProperties | undefined };

/**
 * A bordered "value + label" chip (the base "correct"/"wrong" chip, the streak
 * chip, and any plain config bonus). When a difficulty boost is passed it wraps
 * in a hover tooltip and marks the label with a dotted underline + help cursor,
 * so players can learn why a harder poll paid more without adding a chip.
 */
const PlainScoreChip = ({
	modifier,
	pop,
	difficulty,
}: {
	modifier: ScoreBonusRow;
	pop: ChipPop;
	difficulty?: DifficultyBonus;
}) => {
	const chip = (
		<span
			className={clsx(
				"inline-flex items-baseline gap-1.5 border px-2 py-1",
				chipTone(modifier.value),
				difficulty && "cursor-help",
				pop.className
			)}
			style={pop.style}
		>
			<span className="font-bold tabular-nums">
				{formatDelta(modifier.value)}
			</span>
			<span
				className={clsx(
					"text-xs opacity-70",
					difficulty && "underline decoration-dotted underline-offset-2"
				)}
			>
				{modifier.label}
			</span>
		</span>
	);
	if (!difficulty) return chip;
	return <Tooltip content={difficultyReason(difficulty)}>{chip}</Tooltip>;
};

export const ScoreEquationChips = ({
	isCorrect,
	baseCoverage,
	bonuses,
	earnedCoverage,
	difficulty,
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
					<Paragraph as="span" tone="muted">
						{isCorrect ? "Correct answer" : "Wrong answer"}
					</Paragraph>
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
									className={clsx("inline-block", OPERATOR_TONE, pop.className)}
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
							) : (
								<PlainScoreChip
									modifier={modifier}
									pop={pop}
									difficulty={
										index === 0 && modifier.value >= 0 ? difficulty : undefined
									}
								/>
							)}
						</Fragment>
					);
				})}
				<span
					className={clsx(OPERATOR_TONE, popAt(totalStep).className)}
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
