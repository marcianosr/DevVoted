import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";
import { Entry } from "./Entry.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Entry> = {
	component: Entry,
	title: "Modern/Entry",
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Entry>;

export const Firing: Story = {
	args: {
		label: "Intellisense",
		mark: "pass",
		value: <Delta multiplier={1.5} />,
	},
};

export const Offline: Story = {
	args: {
		label: ".ts",
		mark: "idle",
		dimmed: true,
		value: (
			<Text size="meta" tone="muted">
				offline
			</Text>
		),
	},
};

export const Expanded: Story = {
	args: {
		label: "ESLint",
		mark: "warn",
		value: <Delta kb={-16} />,
		summary: "Common · blocking 1 option on poll 3",
		explainer:
			"Strikes out one wrong answer per gate and charges 16 KB for the hint.",
		defaultOpen: true,
	},
};

export const Collapsed: Story = {
	args: { ...Expanded.args, defaultOpen: false },
};

export const Failing: Story = {
	args: {
		label: "Freemium",
		mark: "fail",
		value: <Delta kb={-128} />,
	},
};

export const Spendable: Story = {
	args: {
		label: "ESLint",
		mark: "warn",
		actions: [{ label: "Use", on: "ESLint", cost: "16 KB", onUse: () => {} }],
		summary: "Common · blocking 1 option on poll 3",
		explainer:
			"Strikes out one wrong answer per gate and charges 16 KB for the hint.",
		defaultOpen: true,
	},
};

export const Unaffordable: Story = {
	args: {
		label: "ESLint",
		mark: "warn",
		actions: [
			{
				label: "Use",
				on: "ESLint",
				cost: "16 KB",
				onUse: () => {},
				disabled: true,
			},
		],
		summary: "Common · blocking 1 option on poll 3",
		explainer:
			"Strikes out one wrong answer per gate and charges 16 KB for the hint.",
		defaultOpen: true,
	},
};
