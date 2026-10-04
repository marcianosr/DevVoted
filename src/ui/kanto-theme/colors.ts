export const KANTO_COLORS = [
	"pallet",
	"viridian",
	"pewter",
	"cerulean",
	"vermillion",
	"lavender",
	"celadon",
	"fuchsia",
	"saffron",
	"cinnabar",
	"indigo",
	"seafoam",
] as const;

export type KantoColor = (typeof KANTO_COLORS)[number];
