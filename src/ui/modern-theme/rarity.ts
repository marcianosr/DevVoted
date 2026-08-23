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

export const RARITY_FILL = {
	common: "bg-celadon",
	uncommon: "bg-cerulean",
	rare: "bg-cinnabar",
	legendary: "bg-legendary",
} as const satisfies Record<Rarity, string>;
