import { clsx } from "clsx";

import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "flex h-2.5 w-full gap-[3px]";

const BOX = "basis-0 rounded-[3px]";

const ONE_SLOT = 1;

const FILLED = "badge-theme";
const LIT = "bg-theme";
const OPEN = "border border-dashed border-theme-faint";

const UNBOUGHT = "border border-theme-soft bg-hatched-theme-fine";

const CAPTION_NAME = "text-theme-faint";

const RESTING = "hover a config to find its room on the track";

const MIN_DRAWN_SLOTS = 1;

export type SlotTrackFill = { name: string; slots: number };

export type SlotTrackProps = {
	fills: readonly SlotTrackFill[];
	capacity: number;
	offered?: boolean;
	highlight?: string;
	resting?: string;
	caption?: boolean;
};

const drawnFillsOf = (fills: readonly SlotTrackFill[]) =>
	fills.filter((fill) => fill.slots >= MIN_DRAWN_SLOTS);

const drawnSlotsOf = (fills: readonly SlotTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

const openSlotsOf = (fills: readonly SlotTrackFill[], capacity: number) =>
	Math.max(0, capacity - drawnSlotsOf(fills));

const slotWords = (slots: number) =>
	`${slots} ${slots === 1 ? "slot" : "slots"}`;

const Box = ({ slots, paint }: { slots: number; paint: string }) => (
	<span style={{ flexGrow: slots }} className={clsx(BOX, paint)} />
);

const costOf = ({ name, slots }: SlotTrackFill, capacity: number) => (
	<>
		<span className={CAPTION_NAME}>{name}</span>
		{` takes ${slotWords(slots)} of ${capacity}`}
	</>
);

export const SlotTrack = ({
	fills,
	capacity,
	offered = false,
	highlight,
	resting = RESTING,
	caption = true,
}: SlotTrackProps) => {
	const drawn = drawnFillsOf(fills);
	const open = openSlotsOf(drawn, capacity);
	const highlighted = fills.find((fill) => fill.name === highlight);

	return (
		<div className={COLUMN}>
			<div aria-hidden className={TRACK}>
				{drawn.map((fill) => (
					<Box
						key={fill.name}
						slots={fill.slots}
						paint={fill.name === highlight ? LIT : FILLED}
					/>
				))}
				{Array.from({ length: open }, (_, index) => (
					<Box key={index} slots={ONE_SLOT} paint={OPEN} />
				))}
				{offered ? <Box slots={ONE_SLOT} paint={UNBOUGHT} /> : null}
			</div>

			{caption ? (
				<Typography variant="hint">
					{highlighted === undefined ? resting : costOf(highlighted, capacity)}
				</Typography>
			) : null}
		</div>
	);
};
