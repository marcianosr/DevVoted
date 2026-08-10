import type { Config } from "./config.model";
import { CONFIGS } from "./configRoster.model";

/**
 * A curated starting loadout (ADR-026). The stack's one-liner carries the
 * choice — a flavor decision, not a math decision. If reading the chips is
 * required to pick, the stack has failed its job.
 */
export type StarterStack = {
	readonly id: string;
	readonly name: string;
	readonly blurb: string;
	readonly configs: readonly Config[];
	/** Flags the safest pick for a first-time player — at most one stack. */
	readonly recommended?: boolean;
};

// TODO(marciano): stack contents and blurbs are the tuning surface here — the
// three below are the approved mock's. Each stack must hold exactly BASE_SLOTS
// configs (the spec enforces it) and read as an identity, not a stat sheet.
export const STARTER_STACKS: readonly StarterStack[] = [
	{
		id: "ship-it",
		// Named for its actual headline category (react, via .jsx), not a vibe
		// phrase — "React Rush" tested as noise, not information (Marciano,
		// 2026-08-10). The blurb still carries the identity/risk framing.
		name: "React",
		// All three configs here multiply COVERAGE, never storage — "payout"
		// implied the storage/KB currency this game deliberately keeps separate
		// from coverage (wiki: coverage is score, storage is reward). Naming the
		// real stat avoids relearning a wrong word later (Marciano, 2026-08-10).
		//
		// Cold Start originally sat here but was swapped for Code Coverage
		// (Marciano, 2026-08-10): Cold Start's check runs every gate for the
		// whole run and a failed check fails the gate outright (no partial
		// credit) — the only unconditional demand across all three starter
		// stacks, and too punishing for a first pick before a player can judge
		// the risk. Code Coverage keeps the reckless, no-defense flavor with a
		// softer demand (never miss twice in a row, not "nail literally poll 1").
		//
		// Blurbs describe playstyle consistently across all three stacks
		// (Marciano, 2026-08-10): a risk/pace read, not a mechanics dump.
		blurb: "Fast but risky.",
		configs: [CONFIGS.js, CONFIGS.jsx, CONFIGS.codeCoverage],
	},
	{
		id: "test-everything",
		// Same naming fix as "React": name states the real headline category
		// (typescript) instead of a vibe phrase (Marciano, 2026-08-10).
		name: "TypeScript",
		// ESLint's cross-out only fires on JS/TS polls (config.eliminatesWrongOptionsFor),
		// so it earns its slot here by covering the exact two categories .js/.ts force
		// you to get right — a real combo, not three configs that happen to share a slot.
		// The only stack with a genuine defense (the cross-out), hence the
		// recommendation for a first run (Marciano, 2026-08-10).
		blurb: "Safer JS/TS focus.",
		configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
		recommended: true,
	},
	{
		id: "full-stack",
		name: "Full stack",
		// Originally css/html/package.json — entirely front-end, the opposite
		// of what the name claims (Marciano, 2026-08-10). Vue + Java + Git is a
		// real, recognizable full-stack combo — a distinct frontend framework
		// (not React/TS, already spoken for by the other two stacks), an actual
		// backend language, and the one tool every stack ships through — rather
		// than three categories picked just to fill three slots.
		blurb: "Balanced across categories.",
		configs: [CONFIGS.vue, CONFIGS.java, CONFIGS.git],
	},
];

export const starterStackFor = (stackId: string): StarterStack | undefined =>
	STARTER_STACKS.find((stack) => stack.id === stackId);

const idKey = (configs: readonly Config[]): string =>
	configs
		.map((config) => config.id)
		.sort()
		.join(",");

/**
 * The stack whose exact contents the pipeline holds, if any. Selection is
 * derived rather than stored: the pipeline is the source of truth, so a stack
 * edited config-by-config later simply stops reading as that stack.
 */
export const stackMatching = (
	slotted: readonly Config[]
): StarterStack | undefined =>
	slotted.length === 0
		? undefined
		: STARTER_STACKS.find((stack) => idKey(stack.configs) === idKey(slotted));
