import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { SKIN_TONE, type SkinTone } from "./tones";

const DOT = "inline-block shrink-0 rounded-full align-middle";

// Hollow runs bigger than filled on purpose: a 6px ring with a 1px border leaves
// a 4px hole and reads as a smudge.
const SHAPE = {
	filled: "size-1.5 bg-current",
	hollow: "size-2 border border-current",
};

const dotVariants = cva(DOT, { variants: { hollow: SHAPE } });

export type DotProps = {
	tone: SkinTone;
	hollow?: boolean;
	className?: string;
};

export const Dot = ({ tone, hollow = false, className }: DotProps) => (
	<span
		aria-hidden
		className={clsx(
			dotVariants({ hollow: hollow ? "hollow" : "filled" }),
			SKIN_TONE[tone],
			className
		)}
	/>
);
