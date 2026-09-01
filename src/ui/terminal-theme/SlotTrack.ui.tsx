import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FAMILY_FILL } from "./families";
import { Text } from "./Text.ui";

const SEGMENT = "h-3.5 basis-0 rounded border";
const EMPTY = "border-dashed border-zinc-700";

export type SlotSegment = {
	family?: ConfigFamily;
	slots: number;
};

export type SlotTrackProps = {
	segments: readonly SlotSegment[];
	slots: number;
	numbered?: boolean;
};

const fillOf = (family: ConfigFamily | undefined) =>
	family === undefined ? EMPTY : FAMILY_FILL[family];

const freeSlots = (segments: readonly SlotSegment[], slots: number) =>
	Math.max(
		0,
		slots - segments.reduce((total, segment) => total + segment.slots, 0)
	);

export const SlotTrack = ({
	segments,
	slots,
	numbered = false,
}: SlotTrackProps) => (
	<div className="flex flex-col gap-1">
		<div aria-hidden className="flex gap-1">
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
		{numbered ? (
			<div
				aria-hidden
				className="grid gap-1"
				style={{ gridTemplateColumns: `repeat(${slots}, 1fr)` }}
			>
				{Array.from({ length: slots }, (_, index) => (
					<Text
						key={index + 1}
						size="caption"
						tone="faint"
						className="text-center"
					>
						{index + 1}
					</Text>
				))}
			</div>
		) : null}
	</div>
);
