export type ModernTone =
	| "default"
	| "muted"
	/** Takes the colour a tinted wrapper already set, which a real tone would
	 * override. */
	| "inherit"
	| "theme"
	| "celadon"
	| "saffron"
	| "vermillion"
	| "cinnabar"
	| "cerulean";

export const MODERN_TONE = {
	default: "text-zinc-100",
	muted: "text-zinc-400",
	inherit: "",
	theme: "text-theme",
	celadon: "text-celadon",
	saffron: "text-saffron",
	vermillion: "text-vermillion",
	cinnabar: "text-cinnabar",
	cerulean: "text-cerulean",
} as const satisfies Record<ModernTone, string>;
