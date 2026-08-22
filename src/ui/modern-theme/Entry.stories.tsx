import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";
import { Entry } from "./Entry.ui";
import { Text } from "./Text.ui";

// Game-design reason: a config has to say what it is doing to THIS poll, not just
// that it is installed — which is why the row carries a verdict, a price and a
// sentence the player can open.
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

/** A config with something to explain opens; one without stays a plain row. */
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

// A config you spend rather than one that reports: the trailing slot is a
// button priced in storage, not a number the run already owns.
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

/** Nothing banked to pay with, so the price stays readable but unpressable. */
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
