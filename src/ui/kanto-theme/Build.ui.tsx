import { clsx } from "clsx";

import {
	ConfigChip,
	type ChipWidth,
	type ConfigChipProps,
} from "./ConfigChip.ui";
import { SlotBox } from "./SlotBox.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";
import { Typography } from "./Typography.ui";
import {
	WeightTrack,
	roomLineOf,
	type WeightTrackFill,
} from "./WeightTrack.ui";

const BAND = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const WRAP_LAYOUT = "flex flex-wrap items-center gap-3";
const COLUMN_LAYOUT = "flex flex-col gap-3";
export type BuildLayout = "wrap" | "column";
export type BuildTrack = "configs" | "occupancy";

const LAYOUT = {
	wrap: WRAP_LAYOUT,
	column: COLUMN_LAYOUT,
} satisfies Record<BuildLayout, string>;

const FOLD = "group/skipped w-full";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 py-0.5 select-none [&::-webkit-details-marker]:hidden";
const CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/skipped:rotate-90";
const FOLD_BODY = "pt-3";

const CARET_GLYPH = "›";
const SEPARATOR = "·";
const TITLE = "Build";

export type BuildSlots = { used: number; capacity: number };

export type BuildWeight = {
	/** The build space the run rents (ADR-082). What it bills is the shop's to say. */
	held: number;
};

type BuildCount =
	| {
			slots: BuildSlots;
			weight?: never;
			highlight?: string;
			onHighlight?: (name?: string) => void;
	  }
	| {
			weight: BuildWeight;
			slots?: never;
			highlight?: string;
			onHighlight?: (name?: string) => void;
	  }
	| {
			slots?: never;
			weight?: never;
			highlight?: never;
			onHighlight?: never;
	  };

const roomOf = ({ used, capacity }: BuildSlots) =>
	used > capacity ? `over by ${used - capacity}` : `${capacity - used} free`;

export const configCountOf = (total: number) => `${total} configs`;

const led = (total: number, counted: boolean) =>
	counted ? [configCountOf(total)] : [];

const summaryOf = (
	total: number,
	count: BuildCount,
	weight: number,
	counted: boolean
): string => {
	if (count.weight !== undefined)
		return [...led(total, counted), roomLineOf(weight, count.weight.held)].join(
			` ${SEPARATOR} `
		);
	if (count.slots === undefined) return configCountOf(total);

	const { used, capacity } = count.slots;
	return [
		...led(total, counted),
		`${used} of ${capacity} slots`,
		roomOf(count.slots),
	].join(` ${SEPARATOR} `);
};

const skippedSummaryOf = (count: number, note?: string) => {
	const head = `${count} skipped`;
	return note === undefined ? head : `${head} ${SEPARATOR} ${note}`;
};

export type BuildProps = {
	configs: readonly ConfigChipProps[];
	layout?: BuildLayout;
	skipped?: readonly ConfigChipProps[];
	skippedNote?: string;
	skippedOpen?: boolean;
	heading?: boolean;
	readout?: boolean;
	list?: boolean;
	configCount?: boolean;
	emptySlots?: boolean;
	emptyLabel?: string;
	resting?: string;
	track?: BuildTrack;
	caption?: boolean;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
} & BuildCount;

export const buildSummaryOf = (props: BuildProps): string => {
	const { configs, skipped = [], configCount = true } = props;

	return summaryOf(
		configs.length + skipped.length,
		props,
		weightOf(fillsOf(configs, skipped)),
		configCount
	);
};

export const buildHeadOf = (props: BuildProps): string => {
	if (props.weight === undefined) return buildSummaryOf(props);

	const { configs, skipped = [], configCount = true } = props;

	return [
		...led(configs.length + skipped.length, configCount),
		roomLineOf(weightOf(fillsOf(configs, skipped)), props.weight.held),
	].join(` ${SEPARATOR} `);
};

const vacantSlotsOf = ({ used, capacity }: BuildSlots) =>
	Math.max(0, capacity - used);

const fillOf = (config: ConfigChipProps): WeightTrackFill[] => {
	if (config.locked === true) return [];
	if (config.slots === undefined) return [];
	return [{ name: config.name, slots: config.slots, info: config.info }];
};

const fillsOf = (
	configs: readonly ConfigChipProps[],
	skipped: readonly ConfigChipProps[]
) => [...configs, ...skipped].flatMap(fillOf);

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

const OCCUPANCY_NAME = "build";

const occupancyFillOf = ({ used }: BuildSlots): SlotTrackFill[] =>
	used < 1 ? [] : [{ name: OCCUPANCY_NAME, slots: used }];

const Vacancy = ({ slots }: { slots: BuildSlots }) => (
	<>
		{Array.from({ length: vacantSlotsOf(slots) }, (_, index) => (
			<SlotBox key={index} />
		))}
	</>
);

const Chip = ({
	config,
	width,
	openInfo,
	onToggleInfo,
	highlight,
	onHighlight,
}: {
	config: ConfigChipProps;
	width?: ChipWidth;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
	highlight?: string;
	onHighlight?: (name?: string) => void;
}) => {
	if (config.locked) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...config}
			width={width}
			infoOpen={config.name === openInfo}
			onToggleInfo={
				onToggleInfo === undefined ? undefined : () => onToggleInfo(config.name)
			}
			highlighted={config.name === highlight}
			onHover={
				onHighlight === undefined ? undefined : () => onHighlight(config.name)
			}
			onLeave={onHighlight === undefined ? undefined : () => onHighlight()}
		/>
	);
};

export const Build = ({
	configs,
	layout = "wrap",
	skipped = [],
	skippedNote,
	skippedOpen = false,
	heading = true,
	readout = true,
	list = true,
	configCount = true,
	emptySlots = true,
	emptyLabel,
	resting,
	track = "configs",
	caption = track === "configs",
	openInfo,
	onToggleInfo,
	...count
}: BuildProps) => {
	const width: ChipWidth | undefined = layout === "wrap" ? undefined : "full";
	const highlight = count.highlight ?? openInfo;
	const fills = fillsOf(configs, skipped);

	const reading = (
		<>
			{count.weight === undefined ? null : (
				<WeightTrack
					fills={fills}
					held={count.weight.held}
					highlight={highlight}
					caption={caption}
				/>
			)}

			{count.slots === undefined ? null : (
				<SlotTrack
					fills={track === "occupancy" ? occupancyFillOf(count.slots) : fills}
					capacity={count.slots.capacity}
					highlight={highlight}
					resting={resting}
					caption={caption}
				/>
			)}
		</>
	);

	const installed = (
		<>
			{emptyLabel === undefined || configs.length > 0 ? null : (
				<SlotBox label={emptyLabel} />
			)}
			{configs.map((config, index) => (
				<Chip
					key={config.name ?? index}
					config={config}
					width={width}
					openInfo={openInfo}
					onToggleInfo={onToggleInfo}
					highlight={highlight}
					onHighlight={count.onHighlight}
				/>
			))}
		</>
	);

	const offered = (
		<>
			{count.slots === undefined || !emptySlots ? null : (
				<Vacancy slots={count.slots} />
			)}
		</>
	);

	return (
		<section className={BAND}>
			{!heading ? null : (
				<div className={TITLE_ROW}>
					<Typography variant="title">{TITLE}</Typography>
					<Typography variant="hint" as="span">
						{summaryOf(
							configs.length + skipped.length,
							count,
							weightOf(fills),
							configCount
						)}
					</Typography>
				</div>
			)}

			{!readout ? null : reading}

			{!readout && !list ? null : (
				<div className={LAYOUT[layout]}>
					{!list ? null : installed}
					{!readout ? null : offered}
				</div>
			)}

			{skipped.length === 0 || !list ? null : (
				<details open={skippedOpen} className={FOLD}>
					<summary className={SUMMARY}>
						<span aria-hidden className={CARET}>
							{CARET_GLYPH}
						</span>
						<Typography variant="hint" as="span">
							{skippedSummaryOf(skipped.length, skippedNote)}
						</Typography>
					</summary>
					<div className={clsx(FOLD_BODY, LAYOUT[layout])}>
						{skipped.map((config, index) => (
							<Chip
								key={config.name ?? index}
								config={config}
								width={width}
								openInfo={openInfo}
								onToggleInfo={onToggleInfo}
								highlight={highlight}
								onHighlight={count.onHighlight}
							/>
						))}
					</div>
				</details>
			)}
		</section>
	);
};
