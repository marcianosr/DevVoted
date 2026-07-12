import type { Config } from "~/domains/economy/models/config.model";

/** A config's rarity tier — the key shared by all rarity-styled UI. */
export type Rarity = Config["rarity"];

/**
 * Design-system tokens mapping a config's rarity to its themed border/text/bg
 * Tailwind classes. Lives in the UI tier so both primitives and domain cards
 * share one source of truth for rarity styling.
 */
export const RARITY_COLORS: Record<
	Rarity,
	{ border: string; text: string; bg: string }
> = {
	common: {
		border: "border-pewter",
		text: "text-pewter",
		bg: "bg-pewter/15",
	},
	uncommon: {
		border: "border-celadon",
		text: "text-celadon",
		bg: "bg-celadon/15",
	},
	rare: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
	},
	legendary: {
		border: "border-indigo",
		text: "text-indigo",
		bg: "bg-indigo/15",
	},
};
