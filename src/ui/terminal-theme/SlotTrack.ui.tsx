import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FAMILY_SOLID } from "./families";
import { Text } from "./Text.ui";

const TRACK = "flex gap-1";
const SEGMENT = "h-3.5 basis-0 rounded-sm";
const EMPTY = "border border-dashed border-zinc-700";

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

export const SlotTrack = ({ segments, slots, reading }: SlotTrackProps) => (
	<div className="flex flex-col gap-1">
		<div aria-hidden className={TRACK}>
			{segments.map((segment, index) => (
				<span
					key={`${segment.family ?? "open"}-${index}`}
					style={{ flexGrow: segment.slots }}
					className={clsx(SEGMENT, fillOf(segment.family))}
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
