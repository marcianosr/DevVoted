import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";
import { Mark } from "./Mark.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Row> = {
	component: Row,
	title: "Modern/Row",
	decorators: [
		(Story) => (
			<div className="w-72">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Row>;

export const Bare: Story = { args: { children: "Intellisense" } };

export const Config: Story = {
	args: {
		leading: <Mark variant="pass" />,
		children: <Text size="body">Intellisense</Text>,
		trailing: <Delta multiplier={1.5} />,
	},
};

export const Dimmed: Story = { args: { ...Config.args, dimmed: true } };

export const Spacings: Story = {
	render: () => (
		<div className="flex flex-col">
			<Row spacing="tight">tight</Row>
			<Row spacing="compact">compact</Row>
			<Row spacing="spacious">spacious</Row>
		</div>
	),
};
