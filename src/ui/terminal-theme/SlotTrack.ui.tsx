import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FAMILY_SOLID } from "./families";
import { Text } from "./Text.ui";

const ROW = "flex flex-wrap items-center gap-x-3 gap-y-1";
const TRACK = "flex items-center gap-1";
const SEGMENT = "h-3.5 shrink-0 rounded-sm";
const EMPTY = "border border-dashed border-zinc-700";

const SLOT_REM = 0.75;
const GAP_REM = 0.25;

const widthOf = (slots: number) =>
	`${slots * SLOT_REM + (slots - 1) * GAP_REM}rem`;

export type SlotSegment = {
	family?: ConfigFamily;
	slots: number;
};

export type SlotTrackProps = {
	segments: readonly SlotSegment[];
	slots: number;
	reading?: string;
};

const fillOf = (family: ConfigFamily | undefined) =>
	family === undefined ? EMPTY : FAMILY_SOLID[family];

const freeSlots = (segments: readonly SlotSegment[], slots: number) =>
	Math.max(
		0,
		slots - segments.reduce((total, segment) => total + segment.slots, 0)
	);

export const SlotTrack = ({ segments, slots, reading }: SlotTrackProps) => {
	const free = freeSlots(segments, slots);

	return (
		<div className={ROW}>
			<span aria-hidden className={TRACK}>
				{segments.map((segment, index) => (
					<span
						key={`${segment.family ?? "open"}-${index}`}
						style={{ width: widthOf(segment.slots) }}
						className={clsx(SEGMENT, fillOf(segment.family))}
					/>
				))}
				{free === 0 ? null : (
					<span
						style={{ width: widthOf(free) }}
						className={clsx(SEGMENT, EMPTY)}
					/>
				)}
			</span>
			{reading === undefined ? null : (
				<Text tone="muted" size="caption">
					{reading}
				</Text>
			)}
		</div>
	);
};
