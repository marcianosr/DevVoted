import type { Border } from "~/domains/economy/models/border.model";
import { STORAGE_UNITS } from "~/lib/storage";

// Border catalog wired to assets in public/borders/. Filenames are kept as-is
// so they match what's on disk; readable names live in `name`.
// To add a border: drop the file in public/borders/<filename> and append an
// entry here. To rename, change `name`/`description` only — id is stable so
// owned-by-user references don't break.
export const borders: Border[] = [
	{
		id: "border-00b9a62e",
		name: "Stack Trace",
		description: "A subtle glow for those who've debugged at 3am.",
		image: "/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png",
		cost: 256 * STORAGE_UNITS.KB,
		rarity: "common",
	},
	{
		id: "border-0a006140",
		name: "Merge Conflict",
		description: "Diagonal stripes — earned by surviving the chaos.",
		image: "/borders/0a006140df75df78a40df5081313d0856a52069f.png",
		cost: 384 * STORAGE_UNITS.KB,
		rarity: "common",
	},
	{
		id: "border-0a47abeb",
		name: "Linter Approved",
		description: "Clean lines. No warnings. Pure satisfaction.",
		image: "/borders/0a47abeb61e5be7e0a905a3a0cbed906dbccc978.png",
		cost: 512 * STORAGE_UNITS.KB,
		rarity: "common",
	},
	{
		id: "border-0a68a1e3",
		name: "Green Build",
		description: "All checks passing. All the time.",
		image: "/borders/0a68a1e3bbee4dab0b6e32f7ff78f051a02b7344.png",
		cost: STORAGE_UNITS.MB,
		rarity: "rare",
	},
	{
		id: "border-0a8f2aff",
		name: "Refactor Monk",
		description: "Clean lines, no comments, infinite patience.",
		image: "/borders/0a8f2aff19ee38cdbe3fcfeaf18bcf1fb33537b8.png",
		cost: 2 * STORAGE_UNITS.MB,
		rarity: "rare",
	},
	{
		id: "border-0a909b1f",
		name: "Prod Outage",
		description: "Pulsing red. Worn with quiet pride.",
		image: "/borders/0a909b1f90599557cde0ec6c5ca614158a8f2449.png",
		cost: 3 * STORAGE_UNITS.MB,
		rarity: "rare",
	},
	{
		id: "border-0b2d1dec",
		name: "Stack Overflow Gold",
		description: "10k reputation worth of glow.",
		image: "/borders/0b2d1dece223a4ef1dfb2ed302bab40b7f401b8f.png",
		cost: 6 * STORAGE_UNITS.MB,
		rarity: "epic",
	},
	{
		id: "border-0b91bcdf",
		name: "Open Source Maintainer",
		description: "Burnt out, yet still merging PRs at 2am.",
		image: "/borders/0b91bcdf7bb9b160faa4382ac7fbbeff9173e2d1.png",
		cost: 8 * STORAGE_UNITS.MB,
		rarity: "epic",
	},
	{
		id: "border-0b9cf3dc",
		name: "Rubber Duck",
		description: "Quack. Quack. Solution found.",
		image: "/borders/0b9cf3dc2fe9fc23484ced8a659cfef78e4affbb.png",
		cost: 12 * STORAGE_UNITS.MB,
		rarity: "epic",
	},
	{
		id: "border-0b22587a",
		name: "Kernel Panic",
		description: "Animated static. Animated dread.",
		image: "/borders/0b22587a8e81f2f3a4ac92417b2c60772dc4685f.apng",
		cost: 32 * STORAGE_UNITS.MB,
		rarity: "legendary",
	},
];

export const findBorderById = (id: string): Border | undefined =>
	borders.find((border) => border.id === id);
