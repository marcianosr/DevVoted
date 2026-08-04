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
		// The static Kanto-gradient ring (no animation — Marciano, 2026-08-04):
		// the element's own border goes transparent so the masked ring overlays
		// exactly where it would sit.
		border: "border-transparent legendary-ring",
		text: "text-fuchsia",
		bg: "bg-lavender/10",
	},
};
