import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import {
	StartScreen,
	type DealtConfig,
	type StartScreenProps,
} from "./StartScreen.ui";

const meta: Meta<typeof StartScreen> = {
	component: StartScreen,
	title: "Modern/Screens/Start",
};
export default meta;

type Story = StoryObj<typeof StartScreen>;

const dealt: readonly DealtConfig[] = [
	{
		id: "ts",
		slots: 1,
		label: ".ts",
		summary: "focus: typescript",
		explainer: "TypeScript polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "intellisense",
		slots: 4,
		label: "Intellisense",
		summary: "all coverage",
		explainer: "All coverage earns ×1.5.",
		note: <Delta multiplier={1.5} />,
	},
	{
		id: "eslint",
		slots: 1,
		label: "ESLint",
		summary: "JS/TS polls",
		explainer:
			"Strikes out one wrong answer per gate and charges a doubling fee for the hint.",
		note: <Chip tone="muted">8 KB a use</Chip>,
	},
	{
		id: "indexeddb",
		slots: 2,
		label: "IndexedDB",
		summary: "every correct answer",
		explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
		note: <Delta kb={8} />,
	},
	{
		id: "rb",
		slots: 1,
		label: ".rb",
		summary: "focus: ruby",
		explainer: "Ruby polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "coldstart",
		slots: 2,
		label: "Cold Start",
		summary: "the gate's opener",
		explainer: "Each gate's first answer earns ×2 coverage.",
		note: <Delta multiplier={2} />,
	},
	{
		id: "overclock",
		slots: 4,
		label: "Overclock",
		summary: "the gate's opener",
		explainer:
			"The gate's first answer earns ×4 coverage. Everything after runs hot at ×0.5, cooling off each clear.",
		note: <Delta multiplier={4} />,
	},
	{
		id: "dependabot",
		slots: 8,
		label: "Dependabot",
		summary: "on a gate clear",
		explainer:
			"1 in 3 gate clears: a random config in your build upgrades, free.",
		note: <Chip tone="muted">1 in 3</Chip>,
	},
];

const base: Omit<StartScreenProps, "pickedIds" | "onToggle"> = {
	theme: "pallet",
	seed: "2026-08-23",
	archive: "1.2 MB",
	dealt,
	dealtFrom: 30,
	lock: { cost: "8 KB", onToggle: () => {} },
	rebuild: { cost: "24 KB", onUse: () => {} },
	combos: [
		{
			id: "typescript",
			name: "Safe start",
			blurb: "stack on typescript, with a lint to save you once",
			recommended: true,
			onTake: () => {},
		},
		{
			id: "reckless",
			name: "Gamble",
			blurb: "fast, and nothing to catch you",
			onTake: () => {},
		},
	],
	slots: 4,
	fits: 4,
	gateName: "Pallet",
	pollCount: 5,
	coverageDemand: 3,
	auditCount: 0,
	streakCap: 2,
	stake: { removeOnMiss: 1, coveragePerWrong: -0.3 },
	reward: { coveragePerCorrect: 1, gateRewardKb: 32 },
	onStart: () => {},
};

const Drafting = (overrides: Partial<StartScreenProps>) => {
	const [pickedIds, setPickedIds] = useState<readonly string[]>([]);

	const toggle = (id: string) =>
		setPickedIds((picked) =>
			picked.includes(id)
				? picked.filter((pickedId) => pickedId !== id)
				: [...picked, id]
		);

	return (
		<StartScreen
			{...base}
			pickedIds={pickedIds}
			onToggle={toggle}
			{...overrides}
		/>
	);
};

export const Fresh: Story = { render: () => <Drafting /> };

export const Partway: Story = {
	render: () => (
		<StartScreen
			{...base}
			dealt={dealt.map((config) =>
				config.id === "rb" ? { ...config, locked: true } : config
			)}
			pickedIds={["ts", "intellisense"]}
			onToggle={() => {}}
		/>
	),
};

export const Ready: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts", "intellisense", "eslint"]}
			onToggle={() => {}}
		/>
	),
};

export const NoCombo: Story = { render: () => <Drafting combos={undefined} /> };

export const Stripped: Story = {
	render: () => (
		<Drafting combos={undefined} rebuild={undefined} lock={undefined} />
	),
};

export const Elite: Story = {
	render: () => (
		<Drafting
			theme="elite"
			gateName="Elite"
			coverageDemand={85}
			auditCount={2}
			stake={{ removeOnMiss: 3, coveragePerWrong: -0.9 }}
			reward={{ coveragePerCorrect: 6.4, gateRewardKb: 416 }}
			slots={8}
			fits={8}
		/>
	),
};

const ARCHIVE_DEALS = {
	buy: {
		costKb: 32,
		makes: 5,
		verb: "Install a new slot from the archive",
		onUse: () => {},
	},
	cash: {
		verb: "Refund the slot to the archive",
		onUse: () => {},
	},
} satisfies NonNullable<StartScreenProps["slotDeals"]>;

export const ArchiveSellsWidth: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts"]}
			archive="512 KB"
			maxSlots={24}
			slotDeals={ARCHIVE_DEALS}
			onToggle={() => {}}
		/>
	),
};

export const ArchiveArmedToBuy: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts"]}
			archive="512 KB"
			maxSlots={24}
			slotDeals={{
				...ARCHIVE_DEALS,
				buy: { ...ARCHIVE_DEALS.buy, armed: true },
			}}
			onToggle={() => {}}
		/>
	),
};

export const ArchiveTooThin: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts"]}
			archive="12 KB"
			maxSlots={24}
			slotDeals={{
				...ARCHIVE_DEALS,
				buy: {
					costKb: 32,
					verb: "Install a new slot from the archive",
					refusal: "Costs 32 KB of archive, you have 12.",
					onUse: () => {},
				},
			}}
			onToggle={() => {}}
		/>
	),
};

export const ArchiveBoughtASlot: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts"]}
			slots={5}
			maxSlots={24}
			archive="480 KB"
			slotDeals={{
				buy: {
					costKb: 64,
					makes: 6,
					verb: "Install a new slot from the archive",
					onUse: () => {},
				},
				cash: {
					costKb: 32,
					makes: 4,
					verb: "Refund the slot to the archive",
					onUse: () => {},
				},
			}}
			onToggle={() => {}}
		/>
	),
};

export const RoomRunningOut: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts", "eslint", "rb"]}
			fits={1}
			onToggle={() => {}}
		/>
	),
};
