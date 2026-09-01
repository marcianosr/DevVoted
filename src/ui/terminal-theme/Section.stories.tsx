import type { Meta, StoryObj } from "@storybook/react";

import { Row } from "./Row.ui";
import { Section } from "./Section.ui";

const meta: Meta<typeof Section> = {
	component: Section,
	title: "Terminal/Section",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Section>;

export const Open: Story = {
	args: {
		label: "Community",
		divided: true,
		children: (
			<>
				<Row name="live runs" detail="8 climbing right now" />
				<Row name="standouts" detail="you hold 2 of 9" />
			</>
		),
	},
};

export const WithMeta: Story = {
	args: {
		label: "Build",
		meta: "4 of 6 slots",
		children: <Row name=".js" detail="JS polls ×1.25" />,
	},
};

export const Shut: Story = {
	args: {
		label: "Storage plan",
		meta: "512 KB cap · free",
		defaultOpen: false,
		children: <Row name="768 KB" detail="16 KB a gate" />,
	},
};
