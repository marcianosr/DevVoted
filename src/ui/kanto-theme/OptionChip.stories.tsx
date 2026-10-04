import type { Meta, StoryObj } from "@storybook/react";

import { OptionChip } from "./OptionChip.ui";
import { Screen } from "./Screen.ui";

const ROW = "flex flex-wrap items-center gap-3";
const COLUMN = "flex flex-col gap-3";

const meta: Meta<typeof OptionChip> = {
	component: OptionChip,
	title: "Kanto/OptionChip",
	argTypes: {
		answerType: { control: "select", options: ["single", "multiple"] },
	},
	args: { letter: "A", label: "justify-content", answerType: "single" },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<OptionChip {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof OptionChip>;

export const Default: Story = {};

export const ExpectedOverReceived: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={COLUMN}>
				<span className={ROW}>
					<OptionChip letter="A" label="justify-content" color="celadon" />
				</span>
				<span className={ROW}>
					<OptionChip letter="B" label="align-items" color="cinnabar" filled />
				</span>
			</div>
		</Screen>
	),
};

export const TheShapesYouAnsweredWith: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={COLUMN}>
				<span className={ROW}>
					<OptionChip letter="A" label="a radio, one answer" color="celadon" />
				</span>
				<span className={ROW}>
					<OptionChip
						letter="A"
						label="a checkbox, several"
						answerType="multiple"
						color="celadon"
					/>
				</span>
			</div>
		</Screen>
	),
};
