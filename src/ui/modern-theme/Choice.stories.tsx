import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip.ui";
import { Choice } from "./Choice.ui";
import { optionLetter } from "./format";

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
		letter: "A",
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
	args: {
		letter: "C",
		label: "arr.slice(2)",
		blocked: true,
		note: "blocked · ESLint",
	},
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
			{options.map((option, index) => (
				<li key={option.id}>
					<Choice
						name="answer"
						letter={optionLetter(index)}
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

export const SettledExpectedAndPicked: Story = {
	args: {
		label: "arr.slice(-2)",
		checked: true,
		settled: true,
		letterTone: "celadon",
		trailing: (
			<>
				<Chip tone="celadon">expected</Chip>
				<Chip tone="celadon">you picked</Chip>
			</>
		),
	},
};

export const SettledWrongPick: Story = {
	args: {
		letter: "B",
		label: "arr.splice(-2)",
		checked: true,
		settled: true,
		letterTone: "cinnabar",
		trailing: <Chip tone="cinnabar">you picked</Chip>,
	},
};

export const SettledBystander: Story = {
	args: { letter: "C", label: "arr.at(-2)", settled: true },
};
