import { useEffect, useRef } from "react";

import { clsx } from "clsx";

import { Avatar } from "~/modules/account/profile/presentation/Avatar.ui";
import type {
	ClimbClimber,
	ClimbFallen,
	ClimbTodayView,
} from "~/modules/run/community/application/community.service";
import {
	gateStartPercent,
	positionPercent,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import {
	type GateSwatch,
	swatchForGate,
	themeColorOf,
} from "~/modules/run/gate/domain/swatch.model";
import { AvatarRing } from "~/modules/run/community/presentation/Voter.ui";
import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { SwatchMark } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

/** Avatars past the third become a "+N" badge — a pin is a position, not a list. */
const MAX_STACK = 3;

const left = (percent: number) => ({ left: `${percent}%` });

/** Below this width the word would outrun the zone it names. */
const UNCHARTED_LABEL_MIN_PERCENT = 14;

/**
 * Past this width the hatch stops reading as a marker and starts reading as the
 * page's background — a first climb charts nothing, so the zone is then almost
 * the whole track. Wide zones keep the dashed edge and nothing else.
 */
const UNCHARTED_HATCH_MAX_PERCENT = 35;

const HATCH =
	"repeating-linear-gradient(45deg, transparent 0 5px, oklch(from var(--theme-color) l c h / 0.14) 5px 6px)";

/**
 * Ground you have never stood on: everything past the deepest point this climb
 * or any of your finished ones reached. Another player standing inside it is the
 * whole point — that is what "ahead of you" looks like.
 */
const UnchartedZone = ({ fromPercent }: { fromPercent: number }) => {
	const start = Math.max(0, fromPercent);
	const width = 100 - start;
	return (
		<div
			className={clsx(
				"absolute inset-y-0 right-0 overflow-hidden",
				// Nothing to divide when the whole window is uncharted.
				start > 0 && "border-l border-dashed border-theme"
			)}
			style={{
				...left(start),
				backgroundImage:
					width <= UNCHARTED_HATCH_MAX_PERCENT ? HATCH : undefined,
			}}
		>
			{/* Top-right, the far end from the boundary: the zone opens exactly where
			    you are standing, and that edge is already carrying the "you" and
			    "best" labels. */}
			{width >= UNCHARTED_LABEL_MIN_PERCENT && (
				<Paragraph
					as="span"
					tone="theme"
					className="absolute top-0 right-2 uppercase"
				>
					Uncharted
				</Paragraph>
			)}
		</div>
	);
};

const Ticks = () => (
	<>
		{Array.from({ length: GATE_COUNT * SLICE_WINDOW + 1 }, (_, slot) => (
			<span
				key={slot}
				aria-hidden
				className={clsx(
					"absolute top-0 w-px",
					slot % SLICE_WINDOW === 0 ? "h-2 bg-zinc-500" : "h-1.5 bg-zinc-700"
				)}
				style={left((slot / (GATE_COUNT * SLICE_WINDOW)) * 100)}
			/>
		))}
	</>
);

// Titled, unlike the poll rows': a climber pin carries no Tooltip, so the
// browser's own hover name is the only place the name appears.
const ClimberAvatar = ({ climber }: { climber: ClimbClimber }) => (
	<AvatarRing player={climber} titled />
);

type ClimberPinProps = {
	group: ClimbClimber[];
	percent: number;
};

const ClimberPin = ({ group, percent }: ClimberPinProps) => {
	const visible = group.slice(0, MAX_STACK);
	const overflow = group.length - visible.length;
	const you = group.some((climber) => climber.you);

	return (
		<div
			className="absolute bottom-2 z-10 flex -translate-x-1/2 flex-col items-center"
			style={left(percent)}
		>
			{you && (
				<Paragraph as="span" tone="cerulean" className="mb-0.5">
					you
				</Paragraph>
			)}
			<span className="relative flex flex-col items-center -space-y-3">
				{visible.map((climber) => (
					<ClimberAvatar key={climber.id} climber={climber} />
				))}
				{overflow > 0 && (
					<span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 text-[9px] text-zinc-100 ring-1 ring-zinc-950">
						+{overflow}
					</span>
				)}
			</span>
		</div>
	);
};

/**
 * Your own ghost: the deepest a finished run of yours reached. Dashed and faded
 * so it reads as a memory of a climb rather than someone standing there, and
 * floated half an avatar above the living so it stays legible when a climber is
 * standing on the exact spot — which is the interesting case, not a rare one.
 *
 * Unlabelled: the legend already says what a dashed avatar is, and there is only
 * ever one of these on the map.
 */
const BestPin = ({
	you,
	percent,
}: {
	you: ClimbClimber | undefined;
	percent: number;
}) => (
	<div className="absolute bottom-5 z-0 -translate-x-1/2" style={left(percent)}>
		<span className="inline-flex rounded-full border-2 border-dashed border-zinc-500 p-px opacity-40">
			{you ? (
				<Avatar
					user={{ id: you.id, displayName: you.displayName }}
					size="sm"
					noTitle
				/>
			) : (
				<span className="block h-6 w-6 rounded-full" />
			)}
		</span>
	</div>
);

/**
 * A run the gate killed today: the player themselves, below the line and dimmed
 * out. Above the line you are climbing, below it you are out — one axis carrying
 * the whole distinction, with no second glyph to learn. The name comes back on
 * hover.
 */
const FallenPin = ({
	fallen,
	percent,
}: {
	fallen: ClimbFallen;
	percent: number;
}) => (
	<div className="absolute top-0 -translate-x-1/2" style={left(percent)}>
		<Tooltip compact content={`${fallen.displayName} — ended here`}>
			<span className="inline-flex cursor-default rounded-full opacity-40 grayscale">
				<Avatar
					user={{
						id: fallen.id,
						displayName: fallen.displayName,
						photoUrl: fallen.photoUrl,
					}}
					size="sm"
					noTitle
				/>
			</span>
		</Tooltip>
	</div>
);

type GateState = "behind" | "current" | "ahead";

/**
 * A gate's badge, sitting on the track at the point the gate begins. On the line
 * rather than under it because the swatch *is* the gate — the ladder and the
 * route are one thing, not a track with a key beneath it.
 *
 * Left-aligned on its boundary rather than centred, so it shares an edge with
 * the name in the grid below and the two read as one column.
 */
const GateMark = ({
	swatch,
	state,
	percent,
}: {
	swatch: GateSwatch;
	state: GateState;
	percent: number;
}) => (
	<span
		{...swatchTheme(themeColorOf(swatch))}
		className={clsx(
			"absolute top-px -translate-y-1/2",
			state === "ahead" && "opacity-75"
		)}
		style={left(percent)}
	>
		<SwatchMark finish={swatch.finish} size="md" />
	</span>
);

/**
 * The gate's number, then its name. The number leads because it is the run's own
 * unit — the HUD counts "gate 6 / 12" and depth is spoken in gates everywhere
 * else — while the name is what the badge is called.
 */
const GateName = ({
	swatch,
	state,
}: {
	swatch: GateSwatch;
	state: GateState;
}) => (
	<li
		{...swatchTheme(themeColorOf(swatch))}
		className="flex min-w-0 items-baseline gap-1"
	>
		<Paragraph as="span" tone="muted" className="tabular-nums">
			{swatch.gate}
		</Paragraph>
		<Paragraph
			as="span"
			tone={state === "current" ? "default" : "muted"}
			className={clsx("truncate", state === "current" && "font-extrabold")}
		>
			{swatch.gateName}
		</Paragraph>
	</li>
);

/**
 * Wide enough for 13 gates to carry a number and a name ("12 Champion"). A
 * laptop clears it and never scrolls; a phone falls short and swipes, which
 * beats a pair of 12px arrows nobody can find.
 */
const TRACK_MIN_WIDTH = "64rem";

export type ClimbTodayProps = ClimbTodayView;

export const ClimbToday = ({
	climbers,
	fallen,
	bestPosition,
}: ClimbTodayProps) => {
	const scroller = useRef<HTMLDivElement>(null);
	const you = climbers.find((climber) => climber.you);

	const youPosition = you ? trackPosition(you) : 0;
	// The furthest you have ever been — this climb or a past one. Past that, the
	// map is showing you ground you have not seen.
	const chartedTo = Math.max(youPosition, bestPosition ?? 0);
	const unchartedPercent = positionPercent(chartedTo);

	// Open on yourself. Percentages against scrollWidth, so nothing about the
	// children has to be measured — and jsdom's zeroes just leave it at 0.
	useEffect(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollLeft =
			(unchartedPercent / 100) * el.scrollWidth - el.clientWidth / 2;
		// Mount only: re-centring mid-read would yank the track out from under you.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Same gate, same poll = one pin with the avatars stacked.
	const pins = climbers.reduce<Map<number, ClimbClimber[]>>((acc, climber) => {
		const position = trackPosition(climber);
		return acc.set(position, [...(acc.get(position) ?? []), climber]);
	}, new Map());

	const gates = Array.from({ length: GATE_COUNT }, (_, gate) =>
		swatchForGate(gate)
	).filter((swatch): swatch is GateSwatch => swatch !== undefined);

	const gateState = (gate: number): GateState => {
		if (you === undefined || gate === you.gate) return "current";
		return gate < you.gate ? "behind" : "ahead";
	};

	return (
		// No card, no title: this is the top of the screen rather than a widget on
		// it, and "the climb today" is the only thing a track of avatars under a
		// row of gates could be.
		<section ref={scroller} className="no-scrollbar overflow-x-auto">
			<div className="space-y-4" style={{ minWidth: TRACK_MIN_WIDTH }}>
				{/* The uncharted zone is scoped to this wrapper — the track and its two
				    lanes — so the gate ladder below stays a clean legend. */}
				<div className="relative">
					{unchartedPercent < 100 && (
						<UnchartedZone fromPercent={unchartedPercent} />
					)}

					<div className="relative z-10 h-20">
						{[...pins.entries()].map(([position, group]) => (
							<ClimberPin
								key={position}
								group={group}
								percent={positionPercent(position)}
							/>
						))}
						{bestPosition !== null && (
							<BestPin you={you} percent={positionPercent(bestPosition)} />
						)}
					</div>

					{/* The line is a bar rather than a border so the swatches can sit on
					    its centre: a border's box excludes itself from `top: 0`, which
					    left every badge floating a couple of pixels above the track. */}
					<div className="relative z-10 h-2">
						<span className="absolute inset-x-0 top-0 h-0.5 bg-zinc-600" />
						<Ticks />
						{gates.map((swatch) => (
							<GateMark
								key={swatch.gate}
								swatch={swatch}
								state={gateState(swatch.gate)}
								percent={gateStartPercent(swatch.gate)}
							/>
						))}
					</div>

					{/* pt-3 clears the swatches straddling the line above. */}
					<div className="relative z-10 h-8 pt-3">
						{fallen.map((mark) => (
							<FallenPin
								key={mark.runId}
								fallen={mark}
								percent={positionPercent(trackPosition(mark))}
							/>
						))}
					</div>
				</div>

				<ol
					className="grid"
					style={{
						gridTemplateColumns: `repeat(${GATE_COUNT}, minmax(0, 1fr))`,
					}}
				>
					{gates.map((swatch) => (
						<GateName
							key={swatch.gate}
							swatch={swatch}
							state={gateState(swatch.gate)}
						/>
					))}
				</ol>
			</div>
		</section>
	);
};
