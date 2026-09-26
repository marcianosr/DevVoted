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
