import { clsx } from "clsx";

import { sizeFill } from "~/ui/sizes";

import { Text } from "./Text.ui";

// Bounded, not fluid: the segments only ever say how the width is *divided*,
// so letting them span a wide panel spends a screenful on a ratio.
const TRACK = "flex max-w-sm gap-1";
const SEGMENT = "h-3.5 basis-0 rounded-sm";
const EMPTY = "border border-dashed border-zinc-500 bg-hatched";

export type SlotSegment = {
	slots: number;
	/** Slots a config holds without running, drawn as the dashed gap a free slot
	 * gets: the width is spent, the colour is not earned. */
	open?: boolean;
};

export type SlotTrackProps = {
	segments: readonly SlotSegment[];
	slots: number;
	reading?: string;
};

const fillOf = (segment: SlotSegment) =>
	segment.open === true ? EMPTY : sizeFill(segment.slots);

const freeSlots = (segments: readonly SlotSegment[], slots: number) =>
	Math.max(
		0,
		slots - segments.reduce((total, segment) => total + segment.slots, 0)
	);

export const SlotTrack = ({ segments, slots, reading }: SlotTrackProps) => (
	<div className="flex flex-col gap-1">
		<div aria-hidden className={TRACK}>
			{segments.map((segment, index) => (
				<span
					key={index}
					style={{ flexGrow: segment.slots }}
					className={clsx(SEGMENT, fillOf(segment))}
				/>
			))}
			{Array.from({ length: freeSlots(segments, slots) }, (_, index) => (
				<span
					key={`free-${index}`}
					style={{ flexGrow: 1 }}
					className={clsx(SEGMENT, EMPTY)}
				/>
			))}
		</div>
		{reading === undefined ? null : (
			<Text tone="muted" size="caption">
				{reading}
			</Text>
		)}
	</div>
);
