import { Config } from "~/domains/configs/models/config";
import { STORAGE_UNITS } from "~/lib/storage";

export const configs: Config[] = [
	{
		id: "vanilla-config",
		name: "Vanilla Config",
		image: "/configs/vanilla.png",
		cost: STORAGE_UNITS.KB * 50, // 50KB
		cooldown: 0,
		description: "Shows community correctness percentage after each answer",
		effect: (context) => {
			// TODO: Implement effect - show community stats
		},
		rarity: "common",
	},
	{
		id: "tree-shake-config",
		name: "Tree Shake Config",
		image: "/configs/treeshake.png",
		cost: STORAGE_UNITS.KB * 75, // 75KB
		cooldown: 3,
		description: "Removes 1 wrong option retroactively (only usable once per 3 polls)",
		effect: (context) => {
			// TODO: Implement effect - remove wrong option
		},
		rarity: "uncommon",
	},
	{
		id: "jest-config",
		name: "Jest Config",
		image: "/configs/jest.png",
		cost: STORAGE_UNITS.KB * 100, // 100KB
		cooldown: 1,
		description: "Gain 1 XP for each other player getting it wrong",
		effect: (context) => {
			// TODO: Implement effect - bonus XP based on other players' mistakes
		},
		rarity: "rare",
	},
	{
		id: "vitest-config",
		name: "Vitest Config",
		image: "/configs/vitest.png",
		cost: STORAGE_UNITS.KB * 120, // 120KB
		cooldown: 0,
		description: "After each answer, see % of other players who got it right",
		effect: (context) => {
			// TODO: Implement effect - show player statistics
		},
		unlockCriteria: {
			requiredXp: 100,
			requiredCategory: "testing",
		},
		rarity: "rare",
	},
	{
		id: "rollup-config",
		name: "Rollup Config",
		image: "/configs/rollup.png",
		cost: STORAGE_UNITS.KB * 80, // 80KB
		cooldown: 2,
		description: "Answering 3 questions in the same category gives +2 bonus XP",
		effect: (context) => {
			// TODO: Implement effect - category combo bonus
		},
		unlockCriteria: {
			requiredStreak: 5,
		},
		rarity: "uncommon",
	},
	{
		id: "webpack-config",
		name: "Webpack Config",
		image: "/configs/webpack.png",
		cost: STORAGE_UNITS.KB * 150, // 150KB
		cooldown: 5,
		description: "Bundle multiple correct answers for 2x XP multiplier",
		effect: (context) => {
			// TODO: Implement effect - XP multiplier for streaks
		},
		unlockCriteria: {
			requiredXp: 200,
			requiredPollsAnswered: 20,
		},
		synergies: ["rollup-config"],
		rarity: "legendary",
	},
	{
		id: "prettier-config",
		name: ".prettierrc",
		image: "/configs/prettier.png",
		cost: STORAGE_UNITS.KB * 30, // 30KB
		cooldown: 0,
		description: "Formats your streak display nicely and adds +1 XP for style points",
		effect: (context) => {
			// TODO: Implement effect - small XP bonus and visual enhancement
		},
		rarity: "common",
	},
	{
		id: "tsconfig",
		name: "TS Config",
		image: "/configs/typescript.png",
		cost: STORAGE_UNITS.KB * 90, // 90KB
		cooldown: 1,
		description: "Type safety bonus: +50% XP for TypeScript category questions",
		effect: (context) => {
			// TODO: Implement effect - category-specific XP bonus
		},
		unlockCriteria: {
			requiredCategory: "typescript",
			requiredXp: 50,
		},
		rarity: "uncommon",
	},
];