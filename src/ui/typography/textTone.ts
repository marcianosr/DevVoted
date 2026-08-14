/**
 * The one text-colour vocabulary, shared by Title, Subtitle and Paragraph. It
 * lived on Paragraph while Paragraph was the only component with tones; the name
 * changed when the other two joined (DVTD-39k8), the tones did not.
 *
 * Two grays, not five: `default` for anything meant to be read and `muted` for
 * everything stepped back from it. The ramp used to run zinc-100/400/500 plus a
 * separate `pewter`, and the level a caption got was effectively arbitrary — the
 * same hint sentence appeared at two of them. `muted` is pewter, the palette's
 * one true gray; the old `faint` sat at 3.7:1 on this background, under the 4.5:1
 * a body of text owes the reader.
 */
export type TextTone =
	| "default"
	| "theme"
	| "muted"
	| "celadon"
	| "cerulean"
	| "vermillion"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "gradient";

export const TEXT_TONE = {
	default: "text-zinc-100",
	theme: "text-theme",
	muted: "text-pewter",
	celadon: "text-celadon",
	cerulean: "text-cerulean",
	vermillion: "text-vermillion",
	viridian: "text-viridian",
	cinnabar: "text-cinnabar",
	saffron: "text-saffron",
	gradient: "text-gradient-green",
} as const satisfies Record<TextTone, string>;
