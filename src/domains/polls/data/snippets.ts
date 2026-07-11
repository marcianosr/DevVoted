import type { CategoryCode } from "~/domains/shared/categories";
import type { Rarity } from "~/ui/rarityColors";

/**
 * What a snippet does when spent on a poll. Each maps to an existing poll-effect
 * channel so the prototype needs no new rendering:
 *  - removeTwoWrong / removeAllWrong → reuse config option-removal (disabledOptionIds)
 *  - revealCorrectCount → reuse the "show correct count" live hint
 *  - armTryCatch → arm gate-failure protection for the current window (server catch)
 */
export type SnippetEffectKind =
	"removeTwoWrong" | "removeAllWrong" | "revealCorrectCount" | "armTryCatch";

export type SnippetType = {
	id: string;
	name: string;
	rarity: Rarity;
	effect: SnippetEffectKind;
	description: string;
};

/**
 * The snippet catalog (Model A prototype). Earned snippets rotate through this
 * list so you see the variety without needing a real drop table yet.
 */
export const SNIPPET_TYPES: SnippetType[] = [
	{
		id: "fifty-fifty",
		name: "50/50",
		rarity: "common",
		effect: "removeTwoWrong",
		description: "Strike out two wrong answers on this poll.",
	},
	{
		id: "console-log",
		name: "console.log",
		rarity: "common",
		effect: "revealCorrectCount",
		description:
			"See how many of your picked answers are correct as you select.",
	},
	{
		id: "prettier",
		name: "Prettier",
		rarity: "rare",
		effect: "removeAllWrong",
		description: "Strike out every wrong answer on this poll.",
	},
	{
		id: "try-catch",
		name: "try/catch",
		rarity: "rare",
		effect: "armTryCatch",
		description:
			"Arm it: a gate failure this window is caught and the run survives. Spent even if you pass.",
	},
];

export const snippetTypeByIndex = (index: number): SnippetType =>
	SNIPPET_TYPES[index % SNIPPET_TYPES.length];

// ─── Specialization: category-scoped earning ────────────────────────────────
// A milestone's "tier" is which 25% band it crosses: 1 = 25%, 2 = 50%, 3 = 75%,
// 4 = 100%. Low tiers give generic snippets anyone can get; deep tiers give a
// category's exclusive SIGNATURE snippet — the reward only specialists reach.

// Generic snippets, earned at the first milestones in any category.
const GENERIC_SNIPPETS: SnippetType[] = [
	{
		id: "fifty-fifty",
		name: "50/50",
		rarity: "common",
		effect: "removeTwoWrong",
		description: "Strike out two wrong answers on this poll.",
	},
	{
		id: "console-log",
		name: "console.log",
		rarity: "common",
		effect: "revealCorrectCount",
		description:
			"See how many of your picked answers are correct as you select.",
	},
];

// The tier at which a category starts granting its exclusive signature snippet.
export const SIGNATURE_TIER = 3; // 75% coverage

// Signature snippets: earned only by pushing ONE category to 75%+. A generalist
// spread thin across categories never reaches these.
const SIGNATURE_SNIPPETS: Partial<Record<CategoryCode, SnippetType>> = {
	js: {
		id: "sig-js-structuredclone",
		name: "structuredClone",
		rarity: "rare",
		effect: "removeAllWrong",
		description: "JS signature — strike out every wrong answer on this poll.",
	},
	ts: {
		id: "sig-ts-satisfies",
		name: "satisfies",
		rarity: "rare",
		effect: "armTryCatch",
		description: "TS signature — arm a gate-failure catch for this window.",
	},
	css: {
		id: "sig-css-has",
		name: ":has()",
		rarity: "rare",
		effect: "removeAllWrong",
		description: "CSS signature — strike out every wrong answer on this poll.",
	},
	react: {
		id: "sig-react-suspense",
		name: "<Suspense>",
		rarity: "rare",
		effect: "armTryCatch",
		description: "React signature — arm a gate-failure catch for this window.",
	},
	git: {
		id: "sig-git-bisect",
		name: "git bisect",
		rarity: "rare",
		effect: "removeAllWrong",
		description: "Git signature — strike out every wrong answer on this poll.",
	},
	html: {
		id: "sig-html-dialog",
		name: "<dialog>",
		rarity: "rare",
		effect: "removeAllWrong",
		description: "HTML signature — strike out every wrong answer on this poll.",
	},
};

/**
 * The snippet earned when `categoryCode` crosses milestone `tier`.
 * Deep tiers (>= SIGNATURE_TIER) yield that category's exclusive signature;
 * otherwise a generic snippet. Categories without a signature fall back to
 * generics, so specializing in them is possible but less rewarding.
 */
export const snippetForMilestone = (
	categoryCode: CategoryCode,
	tier: number
): SnippetType => {
	if (tier >= SIGNATURE_TIER) {
		const signature = SIGNATURE_SNIPPETS[categoryCode];
		if (signature) return signature;
	}
	return GENERIC_SNIPPETS[(tier - 1) % GENERIC_SNIPPETS.length];
};
