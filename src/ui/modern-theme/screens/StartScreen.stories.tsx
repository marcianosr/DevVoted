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
		label: ".ts",
		family: "category",
		summary: "Common · focus: typescript",
		explainer: "TypeScript polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "intellisense",
		label: "Intellisense",
		family: "multiplier",
		summary: "Rare · all coverage",
		explainer: "All coverage earns ×1.5.",
		note: <Delta multiplier={1.5} />,
	},
	{
		id: "eslint",
		label: "ESLint",
		family: "tool",
		summary: "Common · JS/TS polls",
		explainer:
			"Strikes out one wrong answer per gate and charges a doubling fee for the hint.",
		note: <Chip tone="muted">8 KB a use</Chip>,
	},
	{
		id: "indexeddb",
		label: "IndexedDB",
		family: "storage",
		summary: "Uncommon · every correct answer",
		explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
		note: <Delta kb={8} />,
	},
	{
		id: "rb",
		label: ".rb",
		family: "category",
		summary: "Common · focus: ruby",
		explainer: "Ruby polls pay 1.25× coverage.",
		note: <Delta multiplier={1.25} />,
	},
	{
		id: "coldstart",
		label: "Cold Start",
		family: "multiplier",
		summary: "Uncommon · the gate's opener",
		explainer: "Each gate's first answer earns ×2 coverage.",
		note: <Delta multiplier={2} />,
	},
	{
		id: "overclock",
		label: "Overclock",
		family: "gamble",
		summary: "Rare · the gate's opener",
		explainer:
			"The gate's first answer earns ×4 coverage. Everything after runs hot at ×0.5, cooling off each clear.",
		note: <Delta multiplier={4} />,
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
	combo: {
		ids: ["ts", "intellisense", "eslint"],
		blurb: "stack on typescript, with a lint to save you once",
		onTake: () => {},
	},
	slots: [
		{ id: "slot-1" },
		{ id: "slot-2" },
		{ id: "slot-3" },
		{ id: "slot-4", gate: 1 },
	],
	gateName: "Pallet",
	gateNumber: 0,
	gateCount: 12,
	pollCount: 5,
	coverageDemand: 3,
	auditCount: 0,
	removeOnMiss: 1,
	reward: { coveragePerCorrect: 1, gateRewardKb: 32, slotOpens: 4 },
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

export const NoCombo: Story = { render: () => <Drafting combo={undefined} /> };

export const Stripped: Story = {
	render: () => (
		<Drafting combo={undefined} rebuild={undefined} lock={undefined} />
	),
};

export const Elite: Story = {
	render: () => (
		<Drafting
			theme="elite"
			gateName="Elite"
			gateNumber={11}
			coverageDemand={85}
			auditCount={2}
			removeOnMiss={3}
			reward={{ coveragePerCorrect: 6.4, gateRewardKb: 416 }}
			slots={[{ id: "slot-1" }, { id: "slot-2" }, { id: "slot-3" }]}
		/>
	),
};
