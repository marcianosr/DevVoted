import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";
import { Fold, type FoldItem } from "./Fold.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

// Game-design reason: the pipeline is the run's one persistent readout, and a
// player needs its bottom line — what this build costs — without unfolding it.
const meta: Meta<typeof Fold> = {
	component: Fold,
	title: "Modern/Fold",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-72">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Fold>;

const configs: ReadonlyArray<[string, MarkVariant, ReactNode]> = [
	[".ts", "idle", <Delta key=".ts" multiplier={1} />],
	["Intellisense", "pass", <Delta key="i" multiplier={1.5} />],
	["AGENTS.md", "pass", <Delta key="a" multiplier={2} />],
	["ESLint", "warn", <Delta key="e" kb={-16} />],
	["IndexedDB", "pass", <Delta key="d" kb={16} />],
	["Freemium", "fail", <Delta key="f" kb={-128} />],
];

const items: FoldItem[] = configs.map(([label, variant, value]) => ({
	id: label,
	content: (
		<Row leading={<Mark variant={variant} />} trailing={value}>
			<Text size="body">{label}</Text>
		</Row>
	),
}));

export const Open: Story = {
	args: {
		title: "Pipeline",
		value: <Delta kb={-128} />,
		items,
	},
};

export const Closed: Story = {
	args: {
		title: "Coverage",
		value: (
			<Text size="meta" tone="muted">
				38.6/60
			</Text>
		),
		items,
		defaultOpen: false,
	},
};

export const FreeformBody: Story = {
	args: {
		title: "Stake",
		value: (
			<Text size="meta" tone="cinnabar">
				2 left
			</Text>
		),
		children: (
			<Text size="body" tone="muted">
				A miss peels one config and re-runs this gate.
			</Text>
		),
	},
};
