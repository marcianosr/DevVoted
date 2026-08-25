export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export const RARITY_ORDER = [
	"common",
	"uncommon",
	"rare",
	"legendary",
] as const satisfies readonly Rarity[];

export const RARITY_BORDER = {
	common: "border-celadon",
	uncommon: "border-cerulean",
	rare: "border-cinnabar",
	// Transparent so app.css's masked gradient ring paints over it.
	legendary: "border-transparent legendary-ring",
} as const satisfies Record<Rarity, string>;

/**
 * A config row wears its rarity as a rail at its left edge (RARITY_FILL, at full
 * strength — it is 4px wide and needs to carry) plus, for the legendary alone, a
 * wash. Only the legendary gets a fill because eight tinted rows in a column
 * read as eight statuses rather than as a grade, and because a rarity you meet
 * once a run should look like an event.
 */
export const RARITY_WASH = {
	common: "",
	uncommon: "",
	rare: "",
	legendary: "legendary-shimmer",
} as const satisfies Record<Rarity, string>;

/** The rarity's name, in its own colour. The legendary takes the gradient
 * clipped to its glyphs, since it has no single colour to be set in. */
export const RARITY_TEXT = {
	common: "text-celadon",
	uncommon: "text-cerulean",
	rare: "text-cinnabar",
	legendary: "text-legendary",
} as const satisfies Record<Rarity, string>;

export const RARITY_FILL = {
	common: "bg-celadon",
	uncommon: "bg-cerulean",
	rare: "bg-cinnabar",
	legendary: "bg-legendary",
} as const satisfies Record<Rarity, string>;
