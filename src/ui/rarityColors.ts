import type { Config } from "~/domains/economy/models/config.model";

/** A config's rarity tier — the key shared by all rarity-styled UI. */
export type Rarity = Config["rarity"];

/**
 * Design-system tokens mapping a config's rarity to its themed border/text/bg
 * Tailwind classes. Lives in the UI tier so both primitives and domain surfaces
 * share one source of truth for rarity styling.
 */
export const RARITY_COLORS: Record<
	Rarity,
	{ border: string; text: string; bg: string; decoration: string }
> = {
	common: {
		border: "border-cerulean",
		text: "text-cerulean",
		bg: "bg-cerulean/15",
		decoration: "decoration-cerulean",
	},
	uncommon: {
		border: "border-viridian",
		text: "text-viridian",
		bg: "bg-viridian/15",
		decoration: "decoration-viridian",
	},
	rare: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
		decoration: "decoration-cinnabar",
	},
	legendary: {
		// Border is animation-only: chip labels are white, so the border token
		// must not drag the text color along (.prismatic-chip animates both).
		// Decoration stays static — text-decoration-color can't ride the
		// prismatic animation.
		border: "prismatic-border",
		text: "prismatic-chip",
		bg: "bg-lavender/10",
		decoration: "decoration-fuchsia",
	},
};
