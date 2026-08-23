import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import {
	RemovalScreen,
	type RemovalConfig,
	type RemovalScreenProps,
} from "./RemovalScreen.ui";

const meta: Meta<typeof RemovalScreen> = {
	component: RemovalScreen,
	title: "Modern/Screens/Removal",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof RemovalScreen>;

const PIPELINE: readonly RemovalConfig[] = [
	{
		id: "ts",
		label: ".ts",
		notes: <Delta multiplier={1.25} />,
	},
	{
		id: "Intellisense",
		label: "Intellisense",
		notes: <Delta multiplier={1.5} />,
	},
	{
		id: "AGENTS",
		label: "AGENTS.md",
		notes: <Delta multiplier={2} />,
	},
	{
		id: "ESLint",
		label: "ESLint",
		notes: <Chip tone="muted">lint</Chip>,
	},
	{
		id: "IndexedDB",
		label: "IndexedDB",
		notes: <Chip tone="celadon">+8 / correct</Chip>,
	},
	{
		id: "Freemium",
		label: "Freemium",
		notes: <Chip tone="cinnabar">−128 on clear</Chip>,
	},
];

type Preset = Partial<RemovalScreenProps> & { start?: readonly string[] };

const Picking = ({ start = [], ...overrides }: Preset) => {
	const [selectedIds, setSelectedIds] = useState<readonly string[]>(start);

	const toggle = (id: string) =>
		setSelectedIds((picked) =>
			picked.includes(id)
				? picked.filter((current) => current !== id)
				: [...picked, id]
		);

	return (
		<RemovalScreen
			gateName="Lavender"
			required={2}
			configs={PIPELINE}
			selectedIds={selectedIds}
			onToggle={toggle}
			onRemove={() => {}}
			theme="lavender"
			{...overrides}
		/>
	);
};

export const NothingPicked: Story = { render: () => <Picking /> };

export const QuotaMet: Story = {
	render: () => <Picking start={["AGENTS", "ESLint"]} />,
};

export const Overshot: Story = {
	render: () => <Picking start={["AGENTS", "ESLint", "Freemium"]} />,
};

export const DeepGate: Story = {
	render: () => (
		<Picking gateName="Elite" required={3} start={["ts"]} theme="elite" />
	),
};
