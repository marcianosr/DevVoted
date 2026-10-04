import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { TextArea } from "./TextArea.ui";

const noop = () => {};

const meta: Meta<typeof TextArea> = {
	component: TextArea,
	title: "Kanto/TextArea",
	argTypes: {
		caption: { control: "inline-radio", options: ["shown", "hidden"] },
	},
	args: {
		label: "explanation",
		note: "shown after answering · optional",
		caption: "shown",
		value: "",
		placeholder: "Why is the right answer right?",
		onChange: noop,
	},
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<TextArea {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof TextArea>;

export const Captioned: Story = {};

export const Written: Story = {
	args: {
		label: "Question",
		note: undefined,
		caption: "hidden",
		rows: 6,
		value: "What does this log?\n```js\nconsole.log(0.1 + 0.2 === 0.3)\n```",
	},
};
