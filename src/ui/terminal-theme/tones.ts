export type TerminalTone =
	| "default"
	| "muted"
	| "faint"
	| "theme"
	| "celadon"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "cerulean"
	| "lavender"
	| "vermillion";

export const TERMINAL_TONE = {
	default: "text-zinc-100",
	muted: "text-zinc-400",
	faint: "text-zinc-500",
	theme: "text-theme",
	celadon: "text-celadon",
	viridian: "text-viridian",
	cinnabar: "text-cinnabar",
	saffron: "text-saffron",
	cerulean: "text-cerulean",
	lavender: "text-lavender",
	vermillion: "text-vermillion",
} as const satisfies Record<TerminalTone, string>;
