export type ModernTone =
	| "default"
	| "muted"
	/** Take the colour from whatever set it above: a tinted Chip, a coloured
	 * Action, a Crumb wearing the gate. Without it those wrappers paint a colour
	 * their own label then overrides. */
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
