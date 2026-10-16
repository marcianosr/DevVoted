import { clsx } from "clsx";

const WIDTH_BY_SLOTS = [
	"w-5",
	"w-6",
	"w-7",
	"w-8",
	"w-9",
	"w-10",
	"w-11",
	"w-12",
	"w-13",
] as const;

export const SLOTS_AT_CAP = 8;

const CAPPED_WIDTH = "w-13";
const NO_SLOTS = 0;

export const weightWidth = (slots: number): string =>
	WIDTH_BY_SLOTS[Math.max(slots, NO_SLOTS)] ?? CAPPED_WIDTH;

export const isWeightClamped = (slots: number): boolean => slots > SLOTS_AT_CAP;

export const weightLadder: readonly string[] = WIDTH_BY_SLOTS;


const BLOCK =
	"badge-theme inline-flex h-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums";
const CLAMPED = "ring-1 ring-inset ring-theme-soft";

export type WeightProps = {
	slots: number;
};

export const Weight = ({ slots }: WeightProps) => (
	<span
		className={clsx(
			BLOCK,
			weightWidth(slots),
			isWeightClamped(slots) && CLAMPED
		)}
	>
		{slots}
	</span>
);
