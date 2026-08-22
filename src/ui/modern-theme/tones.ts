export type ModernTone =
	| "default"
	| "muted"
	| "dim"
	| "inherit"
	| "theme"
	| "viridian"
	| "saffron"
	| "vermillion"
	| "cinnabar"
	| "cerulean";

export const MODERN_TONE = {
	default: "text-zinc-100",
	muted: "text-zinc-500",
	dim: "text-zinc-400",
	inherit: "",
	theme: "text-theme",
	viridian: "text-viridian",
	saffron: "text-saffron",
	vermillion: "text-vermillion",
	cinnabar: "text-cinnabar",
	cerulean: "text-cerulean",
} as const satisfies Record<ModernTone, string>;
