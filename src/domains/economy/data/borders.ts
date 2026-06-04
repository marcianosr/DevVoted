import type { Border } from "~/domains/economy/models/border.model";
import { STORAGE_UNITS } from "~/lib/storage";

// Border catalog. Replace `image` paths with your actual asset files in
// public/borders/<id>.png (or .webp/.gif for animated). Pricing is the design
// knob — adjust without touching code anywhere else.
export const borders: Border[] = [
	{
		id: "border-stack-trace",
		name: "Stack Trace",
		description: "A subtle red glow for those who've debugged at 3am.",
		image: "/borders/border-stack-trace.png",
		cost: 256 * STORAGE_UNITS.KB,
		rarity: "common",
	},
	{
		id: "border-merge-conflict",
		name: "Merge Conflict",
		description: "Diagonal stripes — earned by surviving the chaos.",
		image: "/borders/border-merge-conflict.png",
		cost: 512 * STORAGE_UNITS.KB,
		rarity: "common",
	},
	{
		id: "border-green-build",
		name: "Green Build",
		description: "All checks passing. All the time.",
		image: "/borders/border-green-build.png",
		cost: STORAGE_UNITS.MB,
		rarity: "rare",
	},
	{
		id: "border-prod-outage",
		name: "Prod Outage",
		description: "Pulsing red. Worn with quiet pride.",
		image: "/borders/border-prod-outage.png",
		cost: 2 * STORAGE_UNITS.MB,
		rarity: "rare",
	},
	{
		id: "border-refactor-monk",
		name: "Refactor Monk",
		description: "Clean lines, no comments, infinite patience.",
		image: "/borders/border-refactor-monk.png",
		cost: 4 * STORAGE_UNITS.MB,
		rarity: "epic",
	},
	{
		id: "border-stack-overflow-gold",
		name: "Stack Overflow Gold",
		description: "10k reputation worth of glow.",
		image: "/borders/border-stack-overflow-gold.png",
		cost: 8 * STORAGE_UNITS.MB,
		rarity: "epic",
	},
	{
		id: "border-kernel-panic",
		name: "Kernel Panic",
		description: "Animated static. Animated dread.",
		image: "/borders/border-kernel-panic.png",
		cost: 16 * STORAGE_UNITS.MB,
		rarity: "legendary",
	},
	{
		id: "border-rubber-duck",
		name: "Rubber Duck",
		description: "Quack. Quack. Solution found.",
		image: "/borders/border-rubber-duck.png",
		cost: 32 * STORAGE_UNITS.MB,
		rarity: "legendary",
	},
];

export const findBorderById = (id: string): Border | undefined =>
	borders.find((border) => border.id === id);
