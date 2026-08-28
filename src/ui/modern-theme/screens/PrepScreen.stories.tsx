import type { Meta, StoryObj } from "@storybook/react";

import { SPOTS_PER_GRADE } from "~/modules/run/config/domain/config.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import type { Rarity } from "../rarity";
import {
	PrepScreen,
	type PrepConfig,
	type PrepScreenProps,
} from "./PrepScreen.ui";

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Modern/Screens/Prep",
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

const graded = (
	config: Omit<PrepConfig, "spots"> & { rarity: Rarity }
): PrepConfig => ({ ...config, spots: SPOTS_PER_GRADE[config.rarity] });

const configs = (
	[
		{
			id: ".ts",
			label: ".ts",
			rarity: "bit",
			note: <Delta multiplier={1.25} />,
			summary: "bit · Focus: typescript",
			explainer: "TypeScript polls pay 1.25× coverage.",
		},
		{
			id: "Intellisense",
			label: "Intellisense",
			rarity: "nibble",
			note: <Delta multiplier={1.5} />,
			summary: "nibble",
			explainer: "All coverage earns ×1.5.",
		},
		{
			id: "IndexedDB",
			label: "IndexedDB",
			rarity: "bit",
			note: <Chip tone="celadon">+8 / correct</Chip>,
			summary: "bit",
			explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
		},
	] satisfies readonly (Omit<PrepConfig, "spots"> & { rarity: Rarity })[]
).map(graded);

const base: PrepScreenProps = {
	theme: "lavender",
	gateName: "Lavender",
	gate: {
		title: "Gate 4 · Lavender",
		audits: ["dependency-outage"],
		storage: { balanceKb: 184 },
		track: { gates: ALL_SWATCHES, cleared: 4 },
	},
	pollCount: 5,
	coverageDemand: 60,
	coverageHeld: 0,
	removeOnMiss: 2,
	coveragePerWrong: -1.3,
	missIsFatal: false,
	configs,
	spots: 6,
	fits: null,
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
				storage: { balanceKb: 104 },
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
				storage: { balanceKb: 48 },
				track: { gates: ALL_SWATCHES, cleared: 1 },
			}}
			theme="boulder"
			coverageDemand={20}
			configs={configs.slice(0, 1)}
			spots={4}
			fits="crumb"
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
				storage: { balanceKb: 612 },
				track: { gates: ALL_SWATCHES, cleared: 11 },
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
