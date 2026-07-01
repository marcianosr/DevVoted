import type { Config } from "~/domains/economy/models/config.model";

/**
 * Design-system tokens mapping a config's rarity to its themed border/text/bg
 * Tailwind classes. Lives in the UI tier so both primitives and domain cards
 * share one source of truth for rarity styling.
 */
export const RARITY_COLORS: Record<
	Config["rarity"],
	{ border: string; text: string; bg: string }
> = {
	common: {
		border: "border-cerulean",
		text: "text-cerulean",
		bg: "bg-cerulean/15",
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
