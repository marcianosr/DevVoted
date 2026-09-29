import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { TextField } from "./TextField.ui";

const noop = () => {};

const meta: Meta<typeof TextField> = {
	component: TextField,
	title: "Kanto/TextField",
	argTypes: {
		caption: { control: "inline-radio", options: ["shown", "hidden"] },
	},
	args: {
		label: "CodeSandbox",
		note: "optional",
		caption: "shown",
		value: "",
		placeholder: "https://codesandbox.io/s/…",
		type: "url",
		onChange: noop,
	},
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<TextField {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof TextField>;

export const Captioned: Story = {};

export const Filled: Story = {
	args: { value: "https://codesandbox.io/s/flex-1" },
};

export const HiddenCaption: Story = {
	args: {
		label: "answer A",
		note: undefined,
		caption: "hidden",
		placeholder: "answer 1",
		type: "text",
	},
};
