import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	ShopScreen,
	type ShopBuildRow,
	type ShopScreenProps,
} from "./ShopScreen.ui";

const noop = () => {};

// "Sell", not "Uninstall": the hint is `${label} for ${price}`, and "Uninstall
// for 16 KB" reads as a fee when the 16 KB is what you are handed. New Run
// keeps "Uninstall" — dropping a config before the run pays nothing.
const sells = (value: string) => ({
	label: "Sell",
	value,
	onArm: noop,
});

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Terminal/Screens/Shop",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ShopScreen>;

const boulderShop: ShopScreenProps = {
	header: {
		title: "Boulder shop",
		subtitle: "next up · gate 2",
		swatch: "boulder",
		value: "96 KB",
		caption: "balance",
	},
	theme: "boulder",
	storage: {
		meta: "4 of 6 slots",
		slots: 6,
	},
	build: {
		meta: "3",
		rows: [
			{
				family: "focus",
				name: ".js",
				slots: 1,
				detail: "JS polls ×1.25",
				version: "v1",
				upgrade: {
					version: "v2",
					changes: [{ from: "×1.25", to: "×1.5" }],
					price: "64 KB",
					label: "Upgrade",
					onArm: noop,
				},
				remove: sells("16 KB"),
			},
			{
				family: "defense",
				name: "ESLint",
				slots: 1,
				detail: "Cross out a wrong answer",
				version: "v1",
				upgrade: {
					version: "v2",
					changes: [{ from: "1 answer", to: "2 answers" }],
					price: "96 KB",
					label: "Upgrade",
					onArm: noop,
				},
				remove: sells("32 KB"),
			},
			{
				family: "economy",
				name: "IndexedDB",
				slots: 2,
				detail: "+8 KB an answer · 96 of 320",
				remove: sells("48 KB"),
			},
		],
	},
	offers: {
		meta: "5",
		rows: [
			{
				family: "focus",
				name: ".py",
				slots: 1,
				detail: "Python polls ×1.25",
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "economy",
				name: "Unit Tests",
				slots: 1,
				detail: "+32 KB on gate clear",
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "defense",
				name: "Telemetry",
				slots: 2,
				detail: "See the community split · fee doubles",
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "risk",
				name: "Deprecated",
				slots: 4,
				detail: "All coverage ×3, −0.5 each clear, then gone",
				price: "128 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				family: "economy",
				name: "Freemium",
				slots: 8,
				detail: "Half price configs · bills 8 KB, doubling",
				price: "192 KB",
				buyLabel: "Install",
				refused: true,
			},
		],
		rebuild: {
			label: "Rebuild offers",
			price: "4 KB",
			onBuy: noop,
		},
	},
	plan: {
		meta: "512 KB cap · free",
		note: "The cap is what you can hold, not what you can earn. A bigger one bills every gate, and dropping to a smaller one burns what will not fit.",
		tiers: [
			{ cap: "512 KB", rate: "free", current: true },
			{ cap: "768 KB", rate: "16 KB a gate", onPick: noop },
			{ cap: "1 MB", rate: "32 KB a gate", onPick: noop },
			{ cap: "1.5 MB", rate: "64 KB a gate", onPick: noop },
			{ cap: "2.5 MB", rate: "128 KB a gate", onPick: noop },
			{ cap: "5 MB", rate: "384 KB a gate", onPick: noop },
			{ cap: "10 MB", rate: "768 KB a gate", onPick: noop },
		],
	},
	continueLabel: "Continue →",
	onContinue: noop,
};

export const BoulderShop: Story = { args: boulderShop };

export const OffersCanBeKept: Story = {
	args: {
		...boulderShop,
		offers: {
			...boulderShop.offers,
			rows: boulderShop.offers.rows.map((row, index) => ({
				...row,
				lock: {
					pinned: index === 0,
					label: "Keep for next shop",
					onToggle: noop,
				},
			})),
		},
	},
};

export const ShopClosed: Story = {
	args: {
		...boulderShop,
		notice:
			"Shop closed. Read-only audits the build you already have, so nothing can be bought, sold or switched before gate 3.",
	},
};

export const ExitBlocked: Story = {
	args: {
		...boulderShop,
		continueLock: "Over capacity, remove a config",
	},
};

export const ThunderShopWithGitTag: Story = {
	args: {
		...boulderShop,
		header: {
			title: "Thunder shop",
			subtitle: "next up · gate 4",
			swatch: "thunder",
			value: "256 KB",
			caption: "balance",
		},
		theme: "thunder",
		build: {
			...boulderShop.build,
			buySlot: {
				label: "Buy slot 7",
				detail: "The seventh is the last one this plan allows",
				price: "64 KB",
				onBuy: noop,
			},
		},
		plan: {
			...boulderShop.plan,
			meta: "768 KB cap · 16 KB a gate",
			tiers: [
				{ cap: "512 KB", rate: "free", onPick: noop },
				{ cap: "768 KB", rate: "16 KB a gate", current: true },
				{ cap: "1 MB", rate: "32 KB a gate", onPick: noop },
				{ cap: "1.5 MB", rate: "64 KB a gate", onPick: noop },
				{ cap: "2.5 MB", rate: "128 KB a gate", onPick: noop },
				{ cap: "5 MB", rate: "384 KB a gate", onPick: noop },
				{ cap: "10 MB", rate: "768 KB a gate", onPick: noop },
			],
		},
		gitTag: {
			label: "Git tag",
			detail: "A dead run checks out at gate 4 instead of gate 0 · one per run",
			price: "128 KB",
			onBuy: noop,
		},
	},
};

export const Mobile: Story = {
	...BoulderShop,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

const seafoamBuildRows: readonly ShopBuildRow[] = [
	{
		family: "focus",
		name: ".js",
		slots: 1,
		detail: "JS polls ×1.5",
		version: "v2",
		remove: sells("32 KB"),
	},
	{
		family: "focus",
		name: ".ts",
		slots: 1,
		detail: "TS polls ×1.25",
		version: "v1",
		upgrade: {
			version: "v2",
			changes: [{ from: "×1.25", to: "×1.5" }],
			price: "64 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("16 KB"),
	},
	{
		family: "focus",
		name: ".py",
		slots: 1,
		detail: "Python polls ×1.25",
		version: "v1",
		upgrade: {
			version: "v2",
			changes: [{ from: "×1.25", to: "×1.5" }],
			price: "64 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("16 KB"),
	},
	{
		family: "defense",
		name: "ESLint",
		slots: 1,
		detail: "Cross out a wrong answer",
		version: "v1",
		upgrade: {
			version: "v2",
			changes: [{ from: "1 answer", to: "2 answers" }],
			price: "96 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("32 KB"),
	},
	{
		family: "defense",
		name: "Telemetry",
		slots: 2,
		detail: "See the community split · fee doubles",
		version: "v1",
		remove: sells("32 KB"),
	},
	{
		family: "risk",
		name: "Deprecated",
		slots: 4,
		detail: "×2.0 left · gone in 2 clears",
		remove: sells("48 KB"),
	},
	{
		family: "economy",
		name: "IndexedDB",
		slots: 2,
		detail: "+8 KB an answer · 288 of 320",
		version: "v1",
		upgrade: {
			version: "v2",
			changes: [
				{ from: "+8 KB", to: "+16 KB" },
				{ from: "320 KB", to: "640 KB" },
			],
			price: "128 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("96 KB"),
	},
	{
		family: "amplify",
		name: "Overclock",
		slots: 4,
		detail: "First answer ×4, every later one ×0.5",
		remove: sells("64 KB"),
	},
];

const seafoamShop: ShopScreenProps = {
	header: {
		title: "Seafoam shop",
		subtitle: "next up · gate 12",
		swatch: "seafoam",
		value: "1.9 MB",
		caption: "balance",
	},
	theme: "seafoam",
	storage: {
		meta: "16 of 16 slots",
		slots: 16,
	},
	build: {
		meta: "8",
		buySlot: {
			label: "Buy slot 17",
			detail: "Every slot after this one costs double",
			price: "256 KB",
			onBuy: noop,
		},
		rows: seafoamBuildRows,
	},
	offers: {
		meta: "6",
		rows: [
			{
				family: "focus",
				name: ".rs",
				slots: 1,
				detail: "Rust polls ×1.25",
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "amplify",
				name: "Code Coverage",
				slots: 2,
				detail: "×2 while coverage is under the demand",
				price: "128 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "defense",
				name: "Prefetch",
				slots: 4,
				detail: "See the next poll's category",
				price: "96 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "defense",
				name: "Intellisense",
				slots: 4,
				detail: "One letter of the right answer",
				price: "128 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "risk",
				name: "WTFPL",
				slots: 8,
				detail: "Everything pays ×3 · every audit runs",
				price: "256 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				family: "economy",
				name: "Volkswagen CI",
				slots: 8,
				detail: "Coverage counts double at the gate check",
				price: "384 KB",
				buyLabel: "Install",
				refused: true,
			},
		],
		rebuild: {
			label: "Rebuild offers",
			price: "16 KB",
			onBuy: noop,
		},
	},
	plan: {
		meta: "2.5 MB cap · 128 KB a gate",
		note: "The cap is what you can hold, not what you can earn. A bigger one bills every gate, and dropping to a smaller one burns what will not fit.",
		tiers: [
			{ cap: "512 KB", rate: "free", onPick: noop },
			{ cap: "768 KB", rate: "16 KB a gate", onPick: noop },
			{ cap: "1 MB", rate: "32 KB a gate", onPick: noop },
			{ cap: "1.5 MB", rate: "64 KB a gate", onPick: noop },
			{ cap: "2.5 MB", rate: "128 KB a gate", current: true },
			{ cap: "5 MB", rate: "384 KB a gate", onPick: noop },
			{ cap: "10 MB", rate: "768 KB a gate", onPick: noop },
		],
	},
	gitTag: {
		label: "Git tag",
		detail: "Tagged at gate 8 · a dead run checks out there",
	},
	continueLabel: "Continue →",
	onContinue: noop,
};

export const SeafoamShop: Story = { args: seafoamShop };

export const SeafoamShopMobile: Story = {
	...SeafoamShop,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

const armRow = (
	rows: readonly ShopBuildRow[],
	name: string,
	armed: ShopBuildRow["armed"]
): readonly ShopBuildRow[] =>
	rows.map((row) => (row.name === name ? { ...row, armed } : row));

export const UpgradeArmed: Story = {
	args: {
		...seafoamShop,
		build: {
			...seafoamShop.build,
			rows: armRow(seafoamBuildRows, ".ts", {
				action: "upgrade",
				confirmLabel: "confirm",
				cancelLabel: "cancel",
				note: "Leaves you 32 KB",
				onConfirm: noop,
				onCancel: noop,
			}),
		},
	},
};

export const UpgradeArmedMobile: Story = {
	...UpgradeArmed,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

const upgradedIndexedDb: readonly ShopBuildRow[] = seafoamBuildRows.map(
	(row) =>
		row.name === "IndexedDB"
			? {
					family: row.family,
					name: row.name,
					slots: row.slots,
					detail: "+16 KB an answer · 288 of 640",
					version: "v2",
					remove: row.remove,
				}
			: row
);

export const RemoveArmed: Story = {
	args: {
		...seafoamShop,
		build: {
			...seafoamShop.build,
			rows: armRow(upgradedIndexedDb, "IndexedDB", {
				action: "remove",
				confirmLabel: "confirm",
				cancelLabel: "cancel",
				note: "Frees 2 slots",
				onConfirm: noop,
				onCancel: noop,
			}),
		},
	},
};

type ArmedRow = {
	name: string;
	action: "upgrade" | "remove";
};

const ArmingShelf = () => {
	const [armed, setArmed] = useState<ArmedRow | undefined>(undefined);

	const arm = (next: ArmedRow) =>
		setArmed((held) =>
			held?.name === next.name && held.action === next.action ? undefined : next
		);

	const rows = boulderShop.build.rows.map((row) => ({
		...row,
		upgrade:
			row.upgrade === undefined
				? undefined
				: {
						...row.upgrade,
						onArm: () => arm({ name: row.name, action: "upgrade" }),
					},
		remove: {
			...row.remove,
			onArm: () => arm({ name: row.name, action: "remove" }),
		},
		armed:
			armed?.name !== row.name
				? undefined
				: {
						action: armed.action,
						confirmLabel: "confirm",
						cancelLabel: "cancel",
						note:
							armed.action === "upgrade" ? "Leaves you 32 KB" : "Frees a slot",
						onConfirm: () => setArmed(undefined),
						onCancel: () => setArmed(undefined),
					},
	}));

	return <ShopScreen {...boulderShop} build={{ ...boulderShop.build, rows }} />;
};

export const ArmingIsLive: Story = { render: () => <ArmingShelf /> };

const earthBuildRows: readonly ShopBuildRow[] = [
	{
		family: "focus",
		name: ".js",
		slots: 1,
		detail: "JS polls ×2.25",
		version: "v5",
		maxed: true,
		remove: sells("128 KB"),
	},
	{
		family: "focus",
		name: ".ts",
		slots: 1,
		detail: "TS polls ×1.75",
		version: "v3",
		upgrade: {
			version: "v4",
			changes: [{ from: "×1.75", to: "×2" }],
			price: "192 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("96 KB"),
	},
	{
		family: "focus",
		name: ".jsx",
		slots: 1,
		detail: "React polls ×1.5",
		version: "v2",
		upgrade: {
			version: "v3",
			changes: [{ from: "×1.5", to: "×1.75" }],
			price: "128 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("64 KB"),
	},
	{
		family: "defense",
		name: "ESLint",
		slots: 1,
		detail: "Cross out 3 wrong answers",
		version: "v4",
		upgrade: {
			version: "v5",
			changes: [{ from: "3 answers", to: "4 answers" }],
			price: "256 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("112 KB"),
	},
	{
		family: "defense",
		name: "Telemetry",
		slots: 2,
		detail: "See the community split · fee doubles",
		version: "v2",
		remove: sells("64 KB"),
	},
	{
		family: "amplify",
		name: "Code Coverage",
		slots: 2,
		detail: "×2 while coverage is under the demand",
		version: "v1",
		upgrade: {
			version: "v2",
			changes: [{ from: "×2", to: "×2.5" }],
			price: "160 KB",
			label: "Upgrade",
			onArm: noop,
		},
		remove: sells("64 KB"),
	},
	{
		family: "defense",
		name: "Prefetch",
		slots: 4,
		detail: "See the next poll's category",
		version: "v3",
		remove: sells("96 KB"),
	},
	{
		family: "economy",
		name: "IndexedDB",
		slots: 2,
		detail: "+16 KB an answer · 512 of 640",
		version: "v2",
		remove: sells("128 KB"),
	},
	{
		family: "amplify",
		name: "Overclock",
		slots: 4,
		detail: "First answer ×4, every later one ×0.5",
		remove: sells("64 KB"),
	},
];

const earthShop: ShopScreenProps = {
	header: {
		title: "Earth shop",
		subtitle: "next up · gate 11",
		swatch: "earth",
		value: "2.4 MB",
		caption: "balance",
	},
	theme: "earth",
	storage: {
		meta: "18 of 24 slots",
		slots: 24,
	},
	build: {
		meta: "9",
		rows: earthBuildRows,
	},
	offers: {
		meta: "5",
		rows: [
			{
				family: "focus",
				name: ".rb",
				slots: 1,
				detail: "Ruby polls ×1.25",
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "economy",
				name: "Unit Tests",
				slots: 1,
				detail: "+32 KB on gate clear",
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "economy",
				name: "Moore's Law",
				slots: 1,
				detail: "+2% of held storage a clear",
				price: "96 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				family: "amplify",
				name: "Dependabot",
				slots: 8,
				detail: "Every config upgrades one rung on a clean gate",
				price: "384 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				family: "economy",
				name: "Freemium",
				slots: 8,
				detail: "Half price configs · bills 8 KB, doubling",
				price: "256 KB",
				buyLabel: "Install",
				refused: true,
			},
		],
		extend: {
			note: "one more offer, here and every shop after",
			label: "extend",
			price: "48 KB",
			onExtend: noop,
		},
		rebuild: {
			label: "Rebuild offers",
			price: "32 KB",
			onBuy: noop,
		},
	},
	plan: {
		meta: "5 MB cap · 384 KB a gate",
		note: "The cap is what you can hold, not what you can earn. A bigger one bills every gate, and dropping to a smaller one burns what will not fit.",
		tiers: [
			{ cap: "512 KB", rate: "free", onPick: noop },
			{ cap: "768 KB", rate: "16 KB a gate", onPick: noop },
			{ cap: "1 MB", rate: "32 KB a gate", onPick: noop },
			{ cap: "1.5 MB", rate: "64 KB a gate", onPick: noop },
			{ cap: "2.5 MB", rate: "128 KB a gate", onPick: noop },
			{ cap: "5 MB", rate: "384 KB a gate", current: true },
			{ cap: "10 MB", rate: "768 KB a gate", onPick: noop },
		],
	},
	continueLabel: "Continue →",
	onContinue: noop,
};

export const EarthShopWithExtend: Story = { args: earthShop };

export const EarthShopWithExtendMobile: Story = {
	...EarthShopWithExtend,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
