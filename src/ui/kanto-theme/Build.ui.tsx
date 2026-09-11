import { clsx } from "clsx";

import {
	ConfigChip,
	type ChipWidth,
	type ConfigChipProps,
} from "./ConfigChip.ui";
import { SlotBox, type SlotCash } from "./SlotBox.ui";
import { SlotOffer, type SlotOfferProps } from "./SlotOffer.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";
import { Typography } from "./Typography.ui";

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

type BuildCount =
	| {
			slots: BuildSlots;
			cash?: SlotCash;
			offer?: SlotOfferProps;
			highlight?: string;
			onHighlight?: (name?: string) => void;
	  }
	| {
			slots?: never;
			cash?: never;
			offer?: never;
			highlight?: never;
			onHighlight?: never;
	  };

const roomOf = ({ used, capacity }: BuildSlots) =>
	used > capacity ? `over by ${used - capacity}` : `${capacity - used} free`;

export const configCountOf = (total: number) => `${total} configs`;

const summaryOf = (total: number, count: BuildCount) => {
	if (count.slots === undefined) return configCountOf(total);

	const { used, capacity } = count.slots;
	const room = roomOf(count.slots);
	return `${configCountOf(total)} ${SEPARATOR} ${used} of ${capacity} slots ${SEPARATOR} ${room}`;
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
	emptyLabel?: string;
	resting?: string;
	track?: BuildTrack;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
} & BuildCount;

const vacantSlotsOf = ({ used, capacity }: BuildSlots) =>
	Math.max(0, capacity - used);

const fillOf = (config: ConfigChipProps): SlotTrackFill[] => {
	if (config.locked === true) return [];
	if (config.slots === undefined) return [];
	return [{ name: config.name, slots: config.slots }];
};

const fillsOf = (
	configs: readonly ConfigChipProps[],
	skipped: readonly ConfigChipProps[]
) => [...configs, ...skipped].flatMap(fillOf);

const OCCUPANCY_NAME = "build";

const occupancyFillOf = ({ used }: BuildSlots): SlotTrackFill[] =>
	used < 1 ? [] : [{ name: OCCUPANCY_NAME, slots: used }];

const Vacancy = ({
	slots,
	cash,
	offer,
}: {
	slots: BuildSlots;
	cash?: SlotCash;
	offer?: SlotOfferProps;
}) => {
	const vacant = vacantSlotsOf(slots);

	return (
		<>
			{Array.from({ length: vacant }, (_, index) => (
				<SlotBox key={index} cash={index === vacant - 1 ? cash : undefined} />
			))}
			{offer === undefined ? null : <SlotOffer {...offer} />}
		</>
	);
};

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
	emptyLabel,
	resting,
	track = "configs",
	openInfo,
	onToggleInfo,
	...count
}: BuildProps) => {
	const width: ChipWidth | undefined = layout === "column" ? "full" : undefined;
	const highlight = count.highlight ?? openInfo;

	return (
		<section className={BAND}>
			{!heading ? null : (
				<div className={TITLE_ROW}>
					<Typography variant="title">{TITLE}</Typography>
					<Typography variant="hint" as="span">
						{summaryOf(configs.length + skipped.length, count)}
					</Typography>
				</div>
			)}

			{count.slots === undefined ? null : (
				<SlotTrack
					fills={
						track === "occupancy"
							? occupancyFillOf(count.slots)
							: fillsOf(configs, skipped)
					}
					capacity={count.slots.capacity}
					offered={count.offer !== undefined}
					highlight={highlight}
					resting={resting}
					caption={track === "configs"}
				/>
			)}

			<div className={LAYOUT[layout]}>
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
				{count.slots === undefined ? null : (
					<Vacancy slots={count.slots} cash={count.cash} offer={count.offer} />
				)}
			</div>

			{skipped.length === 0 ? null : (
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
