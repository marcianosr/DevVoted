import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { StoragePlanProps } from "../StoragePlan.ui";
import {
	ShopScreen,
	type ShopBuildRow,
	type ShopScreenProps,
} from "./ShopScreen.ui";

const noop = () => {};

const STORY_LADDER = [
	{ capKb: 512, rentKb: 0 },
	{ capKb: 768, rentKb: 16 },
	{ capKb: 1024, rentKb: 32 },
	{ capKb: 1536, rentKb: 48 },
	{ capKb: 2560, rentKb: 128 },
	{ capKb: 5120, rentKb: 384 },
	{ capKb: 10240, rentKb: 768 },
];

const storyPlanAt = (held: number, heldKb: number): StoragePlanProps => ({
	meter: {
		heldKb,
		capKb: STORY_LADDER[held].capKb,
		nextCapKb: STORY_LADDER[held + 1]?.capKb,
	},
	cards: STORY_LADDER.map((rung, tier) => ({
		...rung,
		held: tier === held,
		revealed: tier <= held + 1,
		burnsKb: Math.max(0, heldKb - rung.capKb),
		onSelect: tier !== held && tier <= held + 1 ? noop : undefined,
	})),
});

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
		meta: "4 of 6 · 2 free",
		slots: 6,
	},
	build: {
		meta: "3",
		slotRows: [
			{
				name: "Slot 7",
				label: "Buy slot 7",
				price: "64 KB",
				onUse: noop,
			},
		],
		rows: [
			{
				name: ".js",
				slots: 1,
				detail: "JS polls ×1.25",
				version: 1,
				maxVersion: 5,
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
				name: "ESLint",
				slots: 1,
				detail: "Cross out a wrong answer",
				version: 1,
				maxVersion: 5,
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
				name: "IndexedDB",
				slots: 2,
				detail: "+8 KB an answer · 96 of 320",
				version: 1,
				maxVersion: 5,
				remove: sells("48 KB"),
			},
		],
	},
	offers: {
		meta: "5",
		rows: [
			{
				name: ".py",
				slots: 1,
				detail: "Python polls ×1.25",
				version: 1,
				maxVersion: 5,
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Unit Tests",
				slots: 1,
				detail: "+32 KB on gate clear",
				version: 1,
				maxVersion: 5,
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Telemetry",
				slots: 2,
				detail: "See the community split · fee doubles",
				version: 1,
				maxVersion: 2,
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Deprecated",
				slots: 4,
				detail: "All coverage ×3, −0.5 each clear, then gone",
				version: 1,
				maxVersion: 5,
				price: "128 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				name: "Freemium",
				slots: 8,
				detail: "Half price configs · bills 8 KB, doubling",
				version: 1,
				maxVersion: 5,
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
	plan: storyPlanAt(0, 96),
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
					label: index === 0 ? "Release the lock" : "Lock for 16 KB",
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
		storage: { meta: "4 of 2 · over by 2", slots: 2 },
		continueLock: "Over capacity by 2 slots",
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
			slotRows: [
				{
					name: "Slot 7",
					label: "Buy slot 7",
					detail: "The seventh is the last one this plan allows",
					price: "64 KB",
					onUse: noop,
				},
			],
		},
		plan: storyPlanAt(1, 256),
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
		name: ".js",
		slots: 1,
		detail: "JS polls ×1.5",
		version: 2,
		maxVersion: 5,
		remove: sells("32 KB"),
	},
	{
		name: ".ts",
		slots: 1,
		detail: "TS polls ×1.25",
		version: 1,
		maxVersion: 5,
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
		name: ".py",
		slots: 1,
		detail: "Python polls ×1.25",
		version: 1,
		maxVersion: 5,
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
		name: "ESLint",
		slots: 1,
		detail: "Cross out a wrong answer",
		version: 1,
		maxVersion: 5,
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
		name: "Telemetry",
		slots: 2,
		detail: "See the community split · fee doubles",
		version: 1,
		maxVersion: 2,
		remove: sells("32 KB"),
	},
	{
		name: "Deprecated",
		slots: 4,
		detail: "×2.0 left · gone in 2 clears",
		version: 1,
		maxVersion: 5,
		remove: sells("48 KB"),
	},
	{
		name: "IndexedDB",
		slots: 2,
		detail: "+8 KB an answer · 288 of 320",
		version: 1,
		maxVersion: 5,
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
		name: "Overclock",
		slots: 4,
		detail: "First answer ×4, every later one ×0.5",
		version: 1,
		maxVersion: 5,
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
		meta: "16 of 16 · 0 free",
		slots: 16,
	},
	build: {
		meta: "8",
		slotRows: [
			{
				name: "Slot 17",
				label: "Buy slot 17",
				detail: "Every slot after this one costs double",
				price: "256 KB",
				onUse: noop,
			},
		],
		rows: seafoamBuildRows,
	},
	offers: {
		meta: "6",
		rows: [
			{
				name: ".rs",
				slots: 1,
				detail: "Rust polls ×1.25",
				version: 1,
				maxVersion: 5,
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Code Coverage",
				slots: 2,
				detail: "×2 while coverage is under the demand",
				version: 1,
				maxVersion: 5,
				price: "128 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Prefetch",
				slots: 4,
				detail: "See the next poll's category",
				version: 1,
				maxVersion: 5,
				price: "96 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Intellisense",
				slots: 4,
				detail: "One letter of the right answer",
				version: 1,
				maxVersion: 5,
				price: "128 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "WTFPL",
				slots: 8,
				detail: "Everything pays ×3 · every audit runs",
				version: 1,
				maxVersion: 5,
				price: "256 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				name: "Volkswagen CI",
				slots: 8,
				detail: "Coverage counts double at the gate check",
				version: 1,
				maxVersion: 5,
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
	plan: storyPlanAt(4, 1946),
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
					name: row.name,
					slots: row.slots,
					detail: "+16 KB an answer · 288 of 640",
					version: 2,
					maxVersion: 5,
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
		name: ".js",
		slots: 1,
		detail: "JS polls ×2.25",
		version: 5,
		maxVersion: 5,
		maxed: true,
		remove: sells("128 KB"),
	},
	{
		name: ".ts",
		slots: 1,
		detail: "TS polls ×1.75",
		version: 3,
		maxVersion: 5,
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
		name: ".jsx",
		slots: 1,
		detail: "React polls ×1.5",
		version: 2,
		maxVersion: 5,
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
		name: "ESLint",
		slots: 1,
		detail: "Cross out 3 wrong answers",
		version: 4,
		maxVersion: 5,
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
		name: "Telemetry",
		slots: 2,
		detail: "See the community split · fee doubles",
		version: 2,
		maxVersion: 2,
		remove: sells("64 KB"),
	},
	{
		name: "Code Coverage",
		slots: 2,
		detail: "×2 while coverage is under the demand",
		version: 1,
		maxVersion: 5,
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
		name: "Prefetch",
		slots: 4,
		detail: "See the next poll's category",
		version: 3,
		maxVersion: 5,
		remove: sells("96 KB"),
	},
	{
		name: "IndexedDB",
		slots: 2,
		detail: "+16 KB an answer · 512 of 640",
		version: 2,
		maxVersion: 5,
		remove: sells("128 KB"),
	},
	{
		name: "Overclock",
		slots: 4,
		detail: "First answer ×4, every later one ×0.5",
		version: 1,
		maxVersion: 5,
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
		meta: "18 of 24 · 6 free",
		slots: 24,
	},
	build: {
		meta: "9",
		slotRows: [
			{
				name: "Slot 25",
				label: "Buy slot 25",
				detail: "Nothing above the twenty-fourth is for sale",
				price: "32768 KB",
			},
		],
		rows: earthBuildRows,
	},
	offers: {
		meta: "5",
		rows: [
			{
				name: ".rb",
				slots: 1,
				detail: "Ruby polls ×1.25",
				version: 1,
				maxVersion: 5,
				price: "32 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Unit Tests",
				slots: 1,
				detail: "+32 KB on gate clear",
				version: 1,
				maxVersion: 5,
				price: "64 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Moore's Law",
				slots: 1,
				detail: "+2% of held storage a clear",
				version: 1,
				maxVersion: 5,
				price: "96 KB",
				buyLabel: "Install",
				onBuy: noop,
			},
			{
				name: "Dependabot",
				slots: 8,
				detail: "Every config upgrades one rung on a clean gate",
				version: 1,
				maxVersion: 2,
				price: "384 KB",
				buyLabel: "Install",
				refused: true,
			},
			{
				name: "Freemium",
				slots: 8,
				detail: "Half price configs · bills 8 KB, doubling",
				version: 1,
				maxVersion: 5,
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
	plan: storyPlanAt(5, 2458),
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
