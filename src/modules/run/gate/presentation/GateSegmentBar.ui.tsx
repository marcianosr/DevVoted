import { clsx } from "clsx";

import {
	type GateSwatch,
	hasThemeColor,
	themeColorOf,
} from "~/modules/run/gate/domain/swatch.model";
import {
	coverageDemandFor,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
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

/**
 * What that gate asks for, read straight off the rules rather than off the run:
 * the pip previews gates the player has not reached, where there is no live
 * stake to hand it.
 */
const gateDemand = (gate: number): string =>
	`Needs ${coverageDemandFor(gate)}% coverage in its window`;

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
		{...swatchTheme(themeColorOf(swatch))}
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
		{/* An earned gate's demand is history — the pip's job there is the badge. */}
		{standing !== "earned" ? (
			<Paragraph as="span" size="xs" tone="muted">
				{gateDemand(swatch.gate)}
			</Paragraph>
		) : null}
	</span>
);

/**
 * The climb as one pip per gate, each wearing the colour of the swatch that gate
 * awards — so the bar is the badge collection and the depth meter at once. Gates
 * behind you read solid, the gate underway fills with the window's answers, and
 * the rest sit dimmed as a preview of what is left. Every pip is its own button:
 * hover names that gate's badge, and a tap holds the name open, since a 12px dot
 * is unreadable without it and a touch screen has no hover to offer.
 *
 * Each pip also names what its gate asks for. Under ADR-035 every gate demands
 * a fresh coverage total earned in its own window, so the bar is the one
 * surface that can show the whole ladder of demands at once — the stake
 * receipt only ever speaks for the gate in front of you.
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
			// The Elite plate fills with its indigo like any other themed pip; the
			// rim that used to mark its finish now belongs to the current gate.
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
						{...swatchTheme(themeColorOf(swatch))}
						className={clsx(
							"h-3 w-3 cursor-pointer overflow-hidden rounded-sm bg-surface-raised transition hover:brightness-125",
							// The rim means "you are here", and only that. It used to mark the
							// Elite plate instead, which read as an active gate eleven gates
							// before you could reach it — the one thing a bar of pips has to
							// get right is where the player is standing.
							standing === "current" && "ring-1 ring-pewter"
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
