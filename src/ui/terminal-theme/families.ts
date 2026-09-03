import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

// risk wears vermillion and amplify wears lavender, swapped from what these
// tables held before: the Dex prints all five keys in one legend, where an
// orange-red "risk" and a purple "amplify" are the only pairing a player reads
// without the key. Every screen shares these tables, so the two families read
// the same way in the shop and on the pipeline rail.
export const FAMILY_TEXT = {
	focus: "text-celadon",
	defense: "text-cerulean",
	economy: "text-saffron",
	risk: "text-vermillion",
	amplify: "text-lavender",
} as const satisfies Record<ConfigFamily, string>;

export const FAMILY_SOLID = {
	focus: "bg-celadon",
	defense: "bg-cerulean",
	economy: "bg-saffron",
	risk: "bg-vermillion",
	amplify: "bg-lavender",
} as const satisfies Record<ConfigFamily, string>;

// Reading order for the Dex legend, not the roster's own order: the two
// coverage families lead, the two resource families follow, risk sits last.
export const FAMILY_ORDER = [
	"focus",
	"amplify",
	"defense",
	"economy",
	"risk",
] as const satisfies readonly ConfigFamily[];
