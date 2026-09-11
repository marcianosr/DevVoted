import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { Verdict } from "./Verdict.ui";

const OUTCOMES = ["correct", "partial", "wrong"] as const;

const COLUMN = "flex flex-col gap-2";
const ROW = "flex items-center gap-3 text-sm text-theme-muted";

const QUESTION = {
	correct: "which utility type makes every property optional",
	partial: "which of these are valid hook rules",
	wrong: "which property centres a flex child",
} satisfies Record<(typeof OUTCOMES)[number], string>;

const meta: Meta<typeof Verdict> = {
	component: Verdict,
	title: "Kanto/Verdict",
	argTypes: {
		outcome: { control: "select", options: OUTCOMES },
	},
	args: { outcome: "correct" },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Verdict {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Verdict>;

export const Default: Story = {};

export const EveryOutcome: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={COLUMN}>
				{OUTCOMES.map((outcome) => (
					<span key={outcome} className={ROW}>
						<Verdict outcome={outcome} />
						{QUESTION[outcome]}
					</span>
				))}
			</div>
		</Screen>
	),
};
