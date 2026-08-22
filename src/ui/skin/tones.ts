export type SkinTone =
	| "default"
	| "muted"
	| "theme"
	| "saffron"
	| "cinnabar"
	| "viridian"
	| "cerulean";

export const SKIN_TONE = {
	default: "text-zinc-100",
	muted: "text-pewter",
	// Whatever gate the screen is themed for — Screen.ui sets data-gate-theme.
	theme: "text-theme",
	saffron: "text-saffron",
	cinnabar: "text-cinnabar",
	viridian: "text-viridian",
	cerulean: "text-cerulean",
} as const satisfies Record<SkinTone, string>;
