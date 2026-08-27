export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export const RARITY_ORDER = [
	"common",
	"uncommon",
	"rare",
	"legendary",
] as const satisfies readonly Rarity[];

// One rarity palette for the whole game, matching `~/ui/rarityColors` (the
// collection wears it): common cerulean, uncommon viridian, rare cinnabar.
// Celadon stays out of rarity entirely — on the rail it means online/paid,
// and a common config in that green read as a payout.
export const RARITY_BORDER = {
	common: "border-cerulean",
	uncommon: "border-viridian",
	rare: "border-cinnabar",
	// Transparent so app.css's masked gradient ring paints over it.
	legendary: "border-transparent legendary-ring",
} as const satisfies Record<Rarity, string>;

/**
 * The tint an opened row wears, strip and panel together.
 *
 * This replaces the rail that used to run down every config row's left edge. A
 * column of eight rails read as eight statuses rather than as a grade — the
 * rarity is already stated in words beside the name — so it shows on the one
 * row you opened and nowhere else.
 *
 * Goes on the <details> itself, so `open:` is part of the token rather than
 * something a caller composes: Tailwind scans source text, and a class built at
 * runtime is never emitted. The legendary is the exception twice over — it
 * shimmers whether open or shut, because a rarity you meet once a run should
 * look like an event, and `legendary-shimmer` is an app.css class that Tailwind
 * would generate no `open:` variant for anyway.
 */
export const RARITY_WASH = {
	common: "open:bg-cerulean/10",
	uncommon: "open:bg-viridian/10",
	rare: "open:bg-cinnabar/10",
	legendary: "legendary-shimmer",
} as const satisfies Record<Rarity, string>;

/** The rarity's name, in its own colour. The legendary takes the gradient
 * clipped to its glyphs, since it has no single colour to be set in. */
export const RARITY_TEXT = {
	common: "text-cerulean",
	uncommon: "text-viridian",
	rare: "text-cinnabar",
	legendary: "text-legendary",
} as const satisfies Record<Rarity, string>;

export const RARITY_FILL = {
	common: "bg-cerulean",
	uncommon: "bg-viridian",
	rare: "bg-cinnabar",
	legendary: "bg-legendary",
} as const satisfies Record<Rarity, string>;
