import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Choice } from "./Choice.ui";

// Game-design reason: the answer card is where a config's effect becomes visible
// at the moment of choosing — a blocked option has to read as blocked before the
// player commits, not after.
const meta: Meta<typeof Choice> = {
	component: Choice,
	title: "Modern/Choice",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-2xl">
				<Story />
			</div>
		),
	],
	args: {
		name: "answer",
		label: "arr.slice(-2)",
		checked: false,
		onChange: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof Choice>;

export const Unpicked: Story = {};

export const Picked: Story = { args: { checked: true } };

export const Blocked: Story = {
	args: { label: "arr.slice(2)", blocked: true, note: "blocked · ESLint" },
};

const AnswerList = () => {
	const [picked, setPicked] = useState<string | null>(null);
	const options = [
		{ id: "slice-negative", label: "arr.slice(-2)", blocked: false },
		{ id: "splice", label: "arr.splice(-2)", blocked: false },
		{ id: "slice-positive", label: "arr.slice(2)", blocked: true },
		{ id: "at", label: "arr.at(-2)", blocked: false },
	];

	return (
		<ul className="flex flex-col gap-3">
			{options.map((option) => (
				<li key={option.id}>
					<Choice
						name="answer"
						label={option.label}
						checked={picked === option.id}
						blocked={option.blocked}
						note={option.blocked ? "blocked · ESLint" : undefined}
						onChange={() => setPicked(option.id)}
					/>
				</li>
			))}
		</ul>
	);
};

export const Interactive: Story = { render: () => <AnswerList /> };
