import type { Meta, StoryObj } from "@storybook/react";

import { Choice } from "./Choice.ui";
import { Screen } from "./Screen.ui";
import { Trail, type TrailVerdict } from "./Trail.ui";
import { Typography } from "./Typography.ui";

const GATE_POLLS = 5;

const meta: Meta<typeof Trail> = {
	component: Trail,
	title: "Kanto/Trail",
	argTypes: {
		count: { control: { type: "range", min: 1, max: 8 } },
		current: { control: { type: "range", min: 1, max: 9 } },
		verdicts: { control: "object" },
	},
	args: { count: GATE_POLLS, current: 1 },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Trail {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Trail>;

export const Untouched: Story = {};

export const Underway: Story = {
	args: { current: 4, verdicts: ["correct", "correct", "partial"] },
};

export const AllThreeVerdicts: Story = {
	args: { current: 4, verdicts: ["correct", "partial", "wrong"] },
};

export const Finished: Story = {
	args: {
		current: GATE_POLLS + 1,
		verdicts: ["correct", "partial", "wrong", "correct", "correct"],
	},
};

export const OverAPoll: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<Trail
				count={GATE_POLLS}
				current={4}
				verdicts={["correct", "correct", "partial"]}
			/>
			<Typography variant="headline">
				Which reads the last Pokémon in the party?
			</Typography>
			<div className="flex flex-col">
				<Choice letter="A">party.at(-1)</Choice>
				<Choice letter="B" picked>
					party.slice(-1)
				</Choice>
				<Choice letter="C">party.pop()</Choice>
			</div>
		</Screen>
	),
};

const RUNS = [
	{ label: "clean sweep", verdicts: ["correct", "correct", "correct"] },
	{ label: "one slip", verdicts: ["correct", "wrong", "correct"] },
	{ label: "all partial", verdicts: ["partial", "partial", "partial"] },
	{ label: "falling apart", verdicts: ["wrong", "wrong", "partial"] },
] satisfies { label: string; verdicts: TrailVerdict[] }[];

export const VerdictRuns: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian">
			{RUNS.map((run) => (
				<div key={run.label} className="flex flex-col gap-2">
					<Typography variant="caption">{run.label}</Typography>
					<Trail count={GATE_POLLS} current={4} verdicts={run.verdicts} />
				</div>
			))}
		</Screen>
	),
};
