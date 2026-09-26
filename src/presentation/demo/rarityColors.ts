import type { Rarity } from "./types";

export type { Rarity };

export const LEGENDARY_BORDER = "border-transparent legendary-ring";

export const RARITY_COLORS: Record<
	Rarity,
	{ border: string; text: string; bg: string }
> = {
	common: {
		border: "border-cerulean",
		text: "text-cerulean",
		bg: "bg-cerulean/15",
	},
	uncommon: {
		border: "border-viridian",
		text: "text-viridian",
		bg: "bg-viridian/15",
	},
	rare: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
	},
	legendary: {
		border: LEGENDARY_BORDER,
		text: "text-fuchsia",
		bg: "bg-lavender/10",
	},
};
