import type { Meta, StoryObj } from "@storybook/react";

import { Code, Token } from "./Code.ui";

const meta: Meta<typeof Code> = {
	component: Code,
	title: "Modern/Code",
	decorators: [
		(Story) => (
			<div className="max-w-2xl">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Code>;

export const Snippet: Story = {
	args: {
		lines: [
			<>
				{"const arr = ["}
				<Token tone="vermillion">{'"init","lint","test","build","ship"'}</Token>
				{"] as const;"}
			</>,
			<>
				{"const tail = "}
				<Token tone="muted">{"/* ??? */"}</Token>
				{";"}
			</>,
		],
	},
};

export const SingleLine: Story = {
	args: { lines: ["const tail = arr.slice(-2);"] },
};

/** Long lines scroll inside the block instead of widening the screen. */
export const Overflowing: Story = {
	args: {
		lines: [
			"const [penultimate, last] = arr.slice(-2).map((step) => step.toUpperCase());",
		],
	},
};
