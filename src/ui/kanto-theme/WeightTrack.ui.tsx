import { kbLabel } from "~/shared/lib/storage";

import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "relative h-5.5 w-full";
const BLOCK = "absolute inset-y-0 rounded-[3px]";
const ROOM =
	"absolute inset-y-0 right-0 rounded-[3px] border border-dashed border-theme-faint";
const TICK = "absolute -inset-y-1 w-px bg-theme/50";
const MARKS = "relative h-3 w-full";
const MARK =
	"absolute -translate-x-1/2 text-xxs whitespace-nowrap text-theme-muted";

const FILLED = "badge-theme";
const LIT = "bg-theme";

const BLOCK_GAP_PX = 3;
const MIN_DRAWN_SLOTS = 1;
const MIN_AXIS = 1;
const MIN_LABEL_GAP = 0.08;
const FULL = 100;
const PERCENT = "%";

const NO_UPKEEP = 0;
const NO_FREE_WEIGHT = 0;
const FREE_WORD = "free";
const A_GATE = "a gate";
const WEIGHT_WORD = "weight";
const SEPARATOR = "·";
const TO_WORD = "to";
const WITHOUT_IT = "without it,";

export type WeightTrackFill = { name: string; slots: number };

export type UpkeepRung = { weight: number; kb: number };

export type WeightTrackProps = {
	fills: readonly WeightTrackFill[];
	rungs: readonly UpkeepRung[];
	max: number;
	highlight?: string;
	caption?: boolean;
};

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

const byWeight = (rungs: readonly UpkeepRung[]) =>
	[...rungs].sort((one, other) => one.weight - other.weight);

export const upkeepAt = (
	rungs: readonly UpkeepRung[],
	weight: number
): number => {
	const passed = byWeight(rungs).filter((rung) => rung.weight <= weight);
	return passed[passed.length - 1]?.kb ?? NO_UPKEEP;
};

export const freeWeightOf = (rungs: readonly UpkeepRung[]): number => {
	const free = byWeight(rungs).filter((rung) => rung.kb === NO_UPKEEP);
	return free[free.length - 1]?.weight ?? NO_FREE_WEIGHT;
};

const nextRungOf = (rungs: readonly UpkeepRung[], weight: number) =>
	byWeight(rungs).find((rung) => rung.kb > upkeepAt(rungs, weight));

const billWords = (kb: number) =>
	kb === NO_UPKEEP ? FREE_WORD : `${kbLabel(kb)} ${A_GATE}`;

const restingLine = (rungs: readonly UpkeepRung[], weight: number) => {
	const held = `${weight} ${WEIGHT_WORD} ${SEPARATOR} ${billWords(upkeepAt(rungs, weight))}`;
	const next = nextRungOf(rungs, weight);
	if (next === undefined) return held;

	return `${held} ${SEPARATOR} ${next.weight - weight} ${TO_WORD} ${kbLabel(next.kb)}`;
};

const costLine = (
	rungs: readonly UpkeepRung[],
	weight: number,
	fill: WeightTrackFill
) =>
	`${fill.name} ${SEPARATOR} ${fill.slots} ${WEIGHT_WORD} ${SEPARATOR} ${WITHOUT_IT} ${billWords(
		upkeepAt(rungs, weight - fill.slots)
	)}`;

const labelledRungsOf = (rungs: readonly UpkeepRung[], axis: number) => {
	let last: number | undefined;

	return byWeight(rungs).filter((rung) => {
		if (rung.kb === NO_UPKEEP) return false;
		if (last !== undefined && (rung.weight - last) / axis < MIN_LABEL_GAP)
			return false;

		last = rung.weight;
		return true;
	});
};

const Block = ({
	fill,
	start,
	axis,
	lit,
}: {
	fill: WeightTrackFill;
	start: number;
	axis: number;
	lit: boolean;
}) => (
	<span
		style={{
			left: `${(start / axis) * FULL}${PERCENT}`,
			width: `calc(${(fill.slots / axis) * FULL}${PERCENT} - ${BLOCK_GAP_PX}px)`,
		}}
		className={`${BLOCK} ${lit ? LIT : FILLED}`}
	/>
);

export const WeightTrack = ({
	fills,
	rungs,
	max,
	highlight,
	caption = true,
}: WeightTrackProps) => {
	const weight = weightOf(fills);
	const axis = Math.max(max, weight, MIN_AXIS);
	const highlighted = fills.find((fill) => fill.name === highlight);

	let start = 0;
	const blocks = fills.map((fill) => {
		const placed = { fill, start };
		start += fill.slots;
		return placed;
	});

	return (
		<div className={COLUMN}>
			<div aria-hidden className={TRACK}>
				{blocks
					.filter(({ fill }) => fill.slots >= MIN_DRAWN_SLOTS)
					.map((placed) => (
						<Block
							key={placed.fill.name}
							fill={placed.fill}
							start={placed.start}
							axis={axis}
							lit={placed.fill.name === highlight}
						/>
					))}

				{weight >= axis ? null : (
					<span
						style={{ left: `${(weight / axis) * FULL}${PERCENT}` }}
						className={ROOM}
					/>
				)}

				{byWeight(rungs)
					.filter((rung) => rung.weight <= axis)
					.map((rung) => (
						<span
							key={rung.weight}
							style={{ left: `${(rung.weight / axis) * FULL}${PERCENT}` }}
							className={TICK}
						/>
					))}
			</div>

			<span aria-hidden className={MARKS}>
				{labelledRungsOf(rungs, axis)
					.filter((rung) => rung.weight <= axis)
					.map((rung) => (
						<span
							key={rung.weight}
							style={{ left: `${(rung.weight / axis) * FULL}${PERCENT}` }}
							className={MARK}
						>
							{kbLabel(rung.kb)}
						</span>
					))}
			</span>

			{caption ? (
				<Typography variant="hint">
					{highlighted === undefined
						? restingLine(rungs, weight)
						: costLine(rungs, weight, highlighted)}
				</Typography>
			) : null}
		</div>
	);
};
