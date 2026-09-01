import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FAMILY_FILL, FAMILY_SOLID } from "./families";
import { plural } from "./format";

const MARK = "flex shrink-0 items-center gap-0.5";
const BAR = "h-3.5 w-1.5 rounded-sm border";
const SOLID = "h-3.5 rounded-sm";
const PLAIN = "bg-zinc-500";

const SLOT_REM = 0.375;
const GAP_REM = 0.125;

// A solid mark spans exactly the segmented mark's width, so the Dex's group
// header and a config's own mark agree on what four slots look like.
const solidWidth = (slots: number) =>
	`${slots * SLOT_REM + (slots - 1) * GAP_REM}rem`;

export type SlotsProps = {
	/** Left out where the mark reads as size alone, which also drops it from the
	 * accessibility tree: a bar with no family says nothing its own label does
	 * not already say. */
	family?: ConfigFamily;
	slots: number;
	/** One bar instead of one per slot, for the sizes a catalogue lists rather
	 * than the slots a build fills. */
	solid?: boolean;
	className?: string;
};

const label = (family: ConfigFamily | undefined, slots: number) => {
	const size = plural(slots, "slot");
	return family === undefined ? size : `${family} · ${size}`;
};

export const Slots = ({ family, slots, solid, className }: SlotsProps) => {
	const described =
		family === undefined
			? { "aria-hidden": true }
			: { role: "img", "aria-label": label(family, slots) };

	if (solid)
		return (
			<span
				{...described}
				style={{ width: solidWidth(slots) }}
				className={clsx(
					SOLID,
					"shrink-0",
					family === undefined ? PLAIN : FAMILY_SOLID[family],
					className
				)}
			/>
		);

	return (
		<span {...described} className={clsx(MARK, className)}>
			{Array.from({ length: slots }, (_, index) => (
				<span
					key={index}
					className={clsx(
						BAR,
						family === undefined ? PLAIN : FAMILY_FILL[family]
					)}
				/>
			))}
		</span>
	);
};
