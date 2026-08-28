export type Rarity = "bit" | "crumb" | "nibble" | "byte";

export const RARITY_ORDER = [
	"bit",
	"crumb",
	"nibble",
	"byte",
] as const satisfies readonly Rarity[];

export const RARITY_TONE = {
	bit: "text-pewter",
	crumb: "text-cerulean",
	nibble: "text-lavender",
	byte: "text-saffron",
} as const satisfies Record<Rarity, string>;
