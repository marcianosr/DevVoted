import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { SPOTS_PER_GRADE } from "~/modules/run/config/domain/config.model";

import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import type { Rarity } from "../rarity";
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

const graded = (
	config: Omit<DealtConfig, "spots"> & { rarity: Rarity }
): DealtConfig => ({ ...config, spots: SPOTS_PER_GRADE[config.rarity] });

type Graded = Omit<DealtConfig, "spots"> & { rarity: Rarity };

const dealt: readonly DealtConfig[] = (
	[
		{
			id: "ts",
			rarity: "bit",
			label: ".ts",
			summary: "bit · focus: typescript",
			explainer: "TypeScript polls pay 1.25× coverage.",
			note: <Delta multiplier={1.25} />,
		},
		{
			id: "intellisense",
			rarity: "nibble",
			label: "Intellisense",
			summary: "nibble · all coverage",
			explainer: "All coverage earns ×1.5.",
			note: <Delta multiplier={1.5} />,
		},
		{
			id: "eslint",
			rarity: "bit",
			label: "ESLint",
			summary: "bit · JS/TS polls",
			explainer:
				"Strikes out one wrong answer per gate and charges a doubling fee for the hint.",
			note: <Chip tone="muted">8 KB a use</Chip>,
		},
		{
			id: "indexeddb",
			rarity: "crumb",
			label: "IndexedDB",
			summary: "crumb · every correct answer",
			explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
			note: <Delta kb={8} />,
		},
		{
			id: "rb",
			rarity: "bit",
			label: ".rb",
			summary: "bit · focus: ruby",
			explainer: "Ruby polls pay 1.25× coverage.",
			note: <Delta multiplier={1.25} />,
		},
		{
			id: "coldstart",
			rarity: "crumb",
			label: "Cold Start",
			summary: "crumb · the gate's opener",
			explainer: "Each gate's first answer earns ×2 coverage.",
			note: <Delta multiplier={2} />,
		},
		{
			id: "overclock",
			rarity: "nibble",
			label: "Overclock",
			summary: "nibble · the gate's opener",
			explainer:
				"The gate's first answer earns ×4 coverage. Everything after runs hot at ×0.5, cooling off each clear.",
			note: <Delta multiplier={4} />,
		},
		{
			id: "dependabot",
			rarity: "byte",
			label: "Dependabot",
			summary: "byte · on a gate clear",
			explainer:
				"1 in 3 gate clears: a random config in your pipeline upgrades, free.",
			note: <Chip tone="muted">1 in 3</Chip>,
		},
	] satisfies readonly Graded[]
).map(graded);

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
	spots: 4,
	fits: "nibble",
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
			spots={8}
			fits="byte"
		/>
	),
};

export const RoomRunningOut: Story = {
	render: () => (
		<StartScreen
			{...base}
			pickedIds={["ts", "eslint", "rb"]}
			fits="bit"
			onToggle={() => {}}
		/>
	),
};
