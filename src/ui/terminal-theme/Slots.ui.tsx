import { clsx } from "clsx";

import { isBiggestSize, prismaticFill, sizeFill } from "~/ui/sizes";

import { plural } from "./format";

const MARK = "flex shrink-0 items-center gap-0.5";
const MARK_CAPPED = "flex shrink-0 items-center gap-px";
const BAR = "h-3.5 w-1 rounded-xs";
const BAR_CAPPED = "h-3.5 min-w-0 flex-1 rounded-xs";
const SOLID = "h-3.5 rounded-sm";
const PRISMATIC_BAR = "legendary-bar";

const SLOT_REM = 0.25;
const GAP_REM = 0.125;

// A solid mark spans exactly the segmented mark's width, so the Dex's group
// header and a config's own mark agree on what four slots look like.
const solidWidth = (slots: number) =>
	`${slots * SLOT_REM + (slots - 1) * GAP_REM}rem`;

export type SlotsProps = {
	slots: number;
	/** One bar instead of one per slot, for the sizes a catalogue lists rather
	 * than the slots a build fills. */
	solid?: boolean;
	/** Slot count past which the mark stops growing and the bars divide a fixed
	 * width instead. Undefined lets the mark grow with every slot. */
	capSlots?: number;
	className?: string;
};

export const Slots = ({ slots, solid, capSlots, className }: SlotsProps) => {
	const prismatic = isBiggestSize(slots);
	const cappedWidth =
		capSlots !== undefined && slots > capSlots
			? solidWidth(capSlots)
			: undefined;
	const capped = cappedWidth !== undefined;
	const described = { role: "img", "aria-label": plural(slots, "slot") };
	const barFill = (index: number) =>
		prismatic ? prismaticFill(index) : sizeFill(slots);

	if (solid)
		return (
			<span
				{...described}
				style={{ width: solidWidth(slots) }}
				className={clsx(
					SOLID,
					"shrink-0",
					prismatic ? PRISMATIC_BAR : sizeFill(slots),
					className
				)}
			/>
		);

	return (
		<span
			{...described}
			style={cappedWidth === undefined ? undefined : { width: cappedWidth }}
			className={clsx(capped ? MARK_CAPPED : MARK, className)}
		>
			{Array.from({ length: slots }, (_, index) => (
				<span
					key={index}
					className={clsx(capped ? BAR_CAPPED : BAR, barFill(index))}
				/>
			))}
		</span>
	);
};
