import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import type { SwatchTrackItem } from "../SwatchTrack.ui";
import { PrepScreen, type PrepScreenProps } from "./PrepScreen.ui";

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Modern/Screens/Prep",
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

const LADDER = [
	"pallet",
	"boulder",
	"cascade",
	"thunder",
	"lavender",
	"rainbow",
	"soul",
	"marsh",
	"seafoam",
	"volcano",
	"earth",
	"elite",
	"champion",
] as const;

const ladderAt = (current: number): SwatchTrackItem[] =>
	LADDER.map((theme, gate) => {
		if (gate < current) return { gate, state: "earned", theme };
		if (gate === current) return { gate, state: "current", theme };
		return { gate, state: "locked" };
	});

const configs = [
	{
		id: ".ts",
		label: ".ts",
		note: <Delta multiplier={1.25} />,
		summary: "Common · Focus: typescript",
		explainer: "TypeScript polls pay 1.25× coverage.",
	},
	{
		id: "Intellisense",
		label: "Intellisense",
		note: <Delta multiplier={1.5} />,
		summary: "Uncommon",
		explainer: "All coverage earns ×1.5.",
	},
	{
		id: "IndexedDB",
		label: "IndexedDB",
		note: <Chip tone="celadon">+8 / correct</Chip>,
		summary: "Common",
		explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
	},
];

const base: PrepScreenProps = {
	theme: "lavender",
	gateName: "Lavender",
	gate: {
		title: "Gate 4 · Lavender",
		audits: ["dependency-outage"],
		storage: { plan: "Standard plan", used: 184, cap: 640 },
		track: ladderAt(4),
	},
	pollCount: 5,
	coverageDemand: 60,
	coverageHeld: 0,
	removeOnMiss: 2,
	missIsFatal: false,
	configs,
	slots: [{ id: "slot-4", gate: 6 }],
	audits: [
		{
			id: "dependency-outage",
			description: "One config goes offline for this gate.",
		},
	],
	reward: {
		coveragePerCorrect: 2.6,
		storageKbPerCorrect: 8,
		matchingMultiplier: 1.25,
		streakMultiplier: 1.1,
		gateRewardKb: 96,
	},
	bills: [
		{ id: "plan", label: "Standard plan", kb: -32, billedOnMiss: true },
		{ id: "freemium", label: "Freemium", kb: -128, billedOnMiss: false },
	],
	prefetch: {
		thisGate: ["typescript", "javascript", "javascript", "css"],
		nextGate: ["git", "react"],
	},
	onBackToShop: () => {},
	onCommunity: () => {},
	onStart: () => {},
};

export const Lavender: Story = { render: () => <PrepScreen {...base} /> };

export const Fatal: Story = {
	render: () => (
		<PrepScreen {...base} removeOnMiss={configs.length} missIsFatal />
	),
};

export const Locked: Story = {
	render: () => <PrepScreen {...base} startLock="opens in 6h 12m" />,
};

export const Shortfall: Story = {
	render: () => (
		<PrepScreen
			{...base}
			gate={{
				...base.gate,
				storage: { plan: "Standard plan", used: 104, cap: 640 },
			}}
			shortfallKb={56}
		/>
	),
};

export const Suppressed: Story = {
	render: () => (
		<PrepScreen
			{...base}
			audits={[
				{
					id: "dependency-outage",
					description: "One config goes offline for this gate.",
					suppressed: true,
				},
			]}
		/>
	),
};

export const Lean: Story = {
	render: () => (
		<PrepScreen
			{...base}
			gateName="Boulder"
			gate={{
				title: "Gate 1 · Boulder",
				storage: { plan: "Free tier", used: 48, cap: 512 },
				track: ladderAt(1),
			}}
			theme="boulder"
			coverageDemand={20}
			configs={configs.slice(0, 1)}
			slots={[{ id: "slot-1" }]}
			audits={[]}
			bills={[]}
			prefetch={undefined}
			removeOnMiss={1}
			reward={{
				coveragePerCorrect: 1.1,
				storageKbPerCorrect: 0,
				streakMultiplier: 1.1,
				gateRewardKb: 24,
			}}
		/>
	),
};

export const Elite: Story = {
	render: () => (
		<PrepScreen
			{...base}
			gateName="Elite"
			theme="elite"
			gate={{
				title: "Gate 11 · Elite",
				audits: ["cost-overrun", "breaking-change"],
				storage: { plan: "Pro plan", used: 612, cap: 768 },
				track: ladderAt(11),
			}}
			coverageDemand={85}
			removeOnMiss={3}
			audits={[
				{
					id: "cost-overrun",
					description: "Every draft this gate costs double.",
				},
				{
					id: "breaking-change",
					description: "Your highest-level config goes offline.",
				},
			]}
			reward={{
				coveragePerCorrect: 6.4,
				storageKbPerCorrect: 8,
				matchingMultiplier: 1.5,
				streakMultiplier: 1.1,
				gateRewardKb: 416,
			}}
		/>
	),
};
