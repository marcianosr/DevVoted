/**
 * Canonical Kanto test-data pool (see CLAUDE.md → Testing Philosophy).
 * Specs, factories, and stories pull flavored-but-deterministic data from here
 * instead of inventing ad-hoc strings.
 * Source: https://bulbapedia.bulbagarden.net/wiki/Kanto
 */

export const KANTO_TOWNS = [
	{
		name: "Pallet Town",
		motto: "A fairly new and quiet town. It's a small and pretty place.",
	},
	{
		name: "Viridian City",
		motto: "A beautiful city that is enveloped in green year-round.",
	},
	{
		name: "Pewter City",
		motto: "A quiet city nestled between rugged mountains and rocks.",
	},
	{
		name: "Cerulean City",
		motto: "A beautiful city with flowing water and blooming flowers.",
	},
	{
		name: "Vermilion City",
		motto: "A southern city that is bathed in orange by the setting sun.",
	},
	{
		name: "Lavender Town",
		motto: "A small town covered in a beautiful hue of purple.",
	},
	{
		name: "Celadon City",
		motto: "A rich, rainbow colored city where people and Pokémon gather.",
	},
	{ name: "Fuchsia City", motto: "A historic village that has become new." },
	{
		name: "Saffron City",
		motto: "The biggest city in Kanto, shining with a golden light.",
	},
	{
		name: "Cinnabar Island",
		motto: "A once-lively island, silenced by its volcano.",
	},
] as const;

export type KantoTown = (typeof KANTO_TOWNS)[number];

export const GYM_LEADERS = [
	{ name: "Brock", city: "Pewter City", type: "Rock", badge: "Boulder Badge" },
	{
		name: "Misty",
		city: "Cerulean City",
		type: "Water",
		badge: "Cascade Badge",
	},
	{
		name: "Lt. Surge",
		city: "Vermilion City",
		type: "Electric",
		badge: "Thunder Badge",
	},
	{
		name: "Erika",
		city: "Celadon City",
		type: "Grass",
		badge: "Rainbow Badge",
	},
	{ name: "Koga", city: "Fuchsia City", type: "Poison", badge: "Soul Badge" },
	{
		name: "Sabrina",
		city: "Saffron City",
		type: "Psychic",
		badge: "Marsh Badge",
	},
	{
		name: "Blaine",
		city: "Cinnabar Island",
		type: "Fire",
		badge: "Volcano Badge",
	},
	{
		name: "Giovanni",
		city: "Viridian City",
		type: "Ground",
		badge: "Earth Badge",
	},
] as const;

export type GymLeader = (typeof GYM_LEADERS)[number];

export const KANTO_LANDMARKS = [
	"Silph Co.",
	"Pokémon Tower",
	"Cerulean Cave",
	"Pokémon Mansion",
	"Power Plant",
	"Celadon Game Corner",
	"Safari Zone",
	"Seafoam Islands",
	"Victory Road",
	"Indigo Plateau",
	"Mt. Moon",
	"Viridian Forest",
	"Rock Tunnel",
	"Diglett's Cave",
] as const;

/**
 * Ready-made poll-shaped questions — four options, one correct.
 * Use these when a spec needs a full question instead of a bare string.
 */
export const KANTO_QUIZ = [
	{
		question: "What is the tallest building in Saffron City?",
		options: [
			"Silph Co.",
			"Pokémon Tower",
			"Celadon Game Corner",
			"Power Plant",
		],
		correctAnswer: "Silph Co.",
	},
	{
		question: "Which badge does Misty award?",
		options: ["Cascade Badge", "Boulder Badge", "Thunder Badge", "Marsh Badge"],
		correctAnswer: "Cascade Badge",
	},
	{
		question: "Which city is enveloped in green year-round?",
		options: ["Viridian City", "Celadon City", "Pallet Town", "Fuchsia City"],
		correctAnswer: "Viridian City",
	},
	{
		question: "Who is the Gym Leader of Cinnabar Island?",
		options: ["Blaine", "Giovanni", "Sabrina", "Lt. Surge"],
		correctAnswer: "Blaine",
	},
	{
		question: "Where does Victory Road lead?",
		options: ["Indigo Plateau", "Mt. Moon", "Cerulean Cave", "Seafoam Islands"],
		correctAnswer: "Indigo Plateau",
	},
] as const;

/** Canonical deterministic dates for specs (ISO strings — wrap in new Date() as needed). */
export const TEST_DATES = {
	/** Marciano's birthday — the go-to "specific day" */
	birthday: "2026-05-13",
	christmasEve: "2025-12-24",
	christmas: "2025-12-25",
} as const;
