import { BUILD } from "~/shared/lib/copy";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import {
	ConfigChip,
	type ChipWidth,
	type ConfigChipProps,
} from "./ConfigChip.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import { SlotBox } from "./SlotBox.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";
import { Typography } from "./Typography.ui";
import { RECURRING_GLYPH, upkeepLabelOf } from "./upkeep";
import {
	WeightTrack,
	roomLineOf,
	roomPartsOf,
	type NextRung,
	type WeightPreview,
	type WeightTrackFill,
} from "./WeightTrack.ui";

const COPY = {
	occupancyName: "build",
} as const;

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

const NO_UPKEEP = 0;
const BILLED_COLOR: KantoColor = "saffron";
const FREE_COLOR: KantoColor = "viridian";

export type BuildSlots = { used: number; capacity: number };

export type BuildWeight = {
	/**
	 * The build space the run rents, derived from the build itself (ADR-098).
	 * The bill comes with it: since the ladder stopped being a panel of its own,
	 * this is the one surface that owns the recurring figure.
	 */
	held: number;
	perGateKb: number;
	next?: NextRung;
	preview?: WeightPreview;
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
		return [
			...led(total, counted),
			roomLineOf(weight, count.weight.held, count.weight.next),
		].join(` ${SEPARATOR} `);
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
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
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

export const UpkeepBadge = ({ perGateKb }: { perGateKb: number }) => (
	<Badge color={perGateKb > NO_UPKEEP ? BILLED_COLOR : FREE_COLOR}>
		{RECURRING_GLYPH} {upkeepLabelOf(perGateKb)}
	</Badge>
);

/**
 * The bill the build stands to pay, alone. A node rather than a string because
 * the recurring figure wears a badge like every other figure in the kit
 * (ADR-066), and `Figures` cannot find it: a bare weight is not a figure it
 * parses, so badging at the call site is the only way to keep the pair honest.
 */
export const buildHeadOf = (props: BuildProps): ReactNode =>
	props.weight === undefined ? (
		buildSummaryOf(props)
	) : (
		<UpkeepBadge perGateKb={props.weight.perGateKb} />
	);

/**
 * The head's prose, as parts rather than a sentence. It sits below the title
 * instead of beside it because a header that carries both a bill and a room
 * line has no room left for either to be read.
 */
const buildRoomLine = (props: BuildProps): LeadLine | undefined => {
	const { configs, skipped = [], configCount = true, weight } = props;
	if (weight === undefined) return undefined;

	return [
		...led(configs.length + skipped.length, configCount).flatMap(
			(label): LeadLine => [{ figure: label }, ` ${SEPARATOR} `]
		),
		...roomPartsOf(
			weightOf(fillsOf(configs, skipped)),
			weight.held,
			weight.next
		),
	];
};

export const BuildRoom = (props: BuildProps) => {
	const line = buildRoomLine(props);
	return line === undefined ? null : <Lead line={line} />;
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

const occupancyFillOf = ({ used }: BuildSlots): SlotTrackFill[] =>
	used < 1 ? [] : [{ name: COPY.occupancyName, slots: used }];

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
	openUpgrades,
	onToggleUpgrades,
	highlight,
	onHighlight,
}: {
	config: ConfigChipProps;
	width?: ChipWidth;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
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
			upgradesOpen={config.name === openUpgrades}
			onToggleUpgrades={
				onToggleUpgrades === undefined
					? undefined
					: () => onToggleUpgrades(config.name)
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
	openUpgrades,
	onToggleUpgrades,
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
					next={count.weight.next}
					preview={count.weight.preview}
					perGateKb={count.weight.perGateKb}
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
					openUpgrades={openUpgrades}
					onToggleUpgrades={onToggleUpgrades}
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
					<Typography variant="title">{BUILD}</Typography>
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
								openUpgrades={openUpgrades}
								onToggleUpgrades={onToggleUpgrades}
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
