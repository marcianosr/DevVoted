import { clsx } from "clsx";

import {
	type GateSwatch,
	hasThemeColor,
} from "~/modules/run/gate/swatch.model";
import { roundToOneDecimal } from "~/modules/run/rules.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type GateSegmentBarProps = {
	/** One per gate, in climb order — the swatch that gate's clear awards. */
	swatches: readonly GateSwatch[];
	/** Gates banked. Since gates count from 0 it is also the gate being played. */
	gatesCleared: number;
	/** Polls answered in the open window, so the gate underway can fill live. */
	pollsAnswered: number;
	pollsPerGate: number;
	label: string;
};

const clamp01 = (value: number): number =>
	Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

type PipStanding = "earned" | "current" | "ahead";

const standingOf = (gate: number, gatesCleared: number): PipStanding => {
	if (gate < gatesCleared) return "earned";
	return gate === gatesCleared ? "current" : "ahead";
};

const SPOKEN: Record<PipStanding, string> = {
	earned: "earned",
	current: "current gate",
	ahead: "not reached",
};

const spokenName = (swatch: GateSwatch, standing: PipStanding): string =>
	`gate ${swatch.gate}, ${swatch.name}, ${SPOKEN[standing]}`;

const PipDetail = ({
	swatch,
	standing,
	pollsAnswered,
	pollsPerGate,
}: {
	swatch: GateSwatch;
	standing: PipStanding;
	pollsAnswered: number;
	pollsPerGate: number;
}) => (
	<span
		{...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
		className="flex flex-col gap-1 p-1"
	>
		<Paragraph as="span" size="xs" tone="muted">
			gate {swatch.gate}
		</Paragraph>
		<span className="flex items-center gap-2">
			<SwatchMark finish={swatch.finish} size="sm" />
			<Paragraph
				as="span"
				size="sm"
				className={clsx("font-bold", swatchNameClass(swatch.finish))}
			>
				{swatch.name}
			</Paragraph>
		</span>

		{standing === "earned" ? (
			<Paragraph as="span" size="xs" tone="viridian">
				Earned
			</Paragraph>
		) : null}
		{standing === "current" ? (
			<Paragraph as="span" size="xs" tone="saffron">
				Running now · {pollsAnswered} of {pollsPerGate} answered
			</Paragraph>
		) : null}
		{standing === "ahead" ? (
			<Paragraph as="span" size="xs" tone="muted">
				Clear gate {swatch.gate} to earn it
			</Paragraph>
		) : null}
	</span>
);

/**
 * The climb as one pip per gate, each wearing the colour of the swatch that gate
 * awards — so the bar is the badge collection and the depth meter at once. Gates
 * behind you read solid, the gate underway fills with the window's answers, and
 * the rest sit dimmed as a preview of what is left. Every pip is its own button,
 * so hover (or tap) names that gate's badge.
 *
 * Deliberately carries no coverage: since ADR-019 coverage buys width, not depth,
 * and the shop's unlock row is where that progress belongs.
 */
export const GateSegmentBar = ({
	swatches,
	gatesCleared,
	pollsAnswered,
	pollsPerGate,
	label,
}: GateSegmentBarProps) => (
	<span role="group" aria-label={label} className="flex shrink-0 gap-1">
		{swatches.map((swatch) => {
			const standing = standingOf(swatch.gate, gatesCleared);
			// A 12px pip is too small for a rim to read, so the Elite plate fills
			// with its indigo like any other themed pip; its popover carries the rim.
			const fill = hasThemeColor(swatch) ? "bg-theme" : "bg-legendary";
			const width =
				standing === "earned"
					? 1
					: standing === "current"
						? clamp01(pollsAnswered / pollsPerGate)
						: 0;
			return (
				<Tooltip
					key={swatch.gate}
					compact
					content={
						<PipDetail
							swatch={swatch}
							standing={standing}
							pollsAnswered={pollsAnswered}
							pollsPerGate={pollsPerGate}
						/>
					}
				>
					<button
						type="button"
						aria-label={spokenName(swatch, standing)}
						{...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
						className={clsx(
							"h-3 w-3 cursor-pointer overflow-hidden rounded-sm bg-zinc-800 transition hover:brightness-125",
							// Indigo is darker than the empty track, so the Elite pip would
							// read as a hole. Its rim is what marks it present at all.
							swatch.finish === "plate" && "ring-1 ring-pewter"
						)}
					>
						<span
							className={clsx(
								"block h-full rounded-sm transition-all",
								fill,
								standing !== "earned" && "opacity-40"
							)}
							style={{ width: `${roundToOneDecimal(width * 100)}%` }}
						/>
					</button>
				</Tooltip>
			);
		})}
	</span>
);
