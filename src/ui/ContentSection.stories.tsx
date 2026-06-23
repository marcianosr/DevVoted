import type { Meta, StoryObj } from "@storybook/react";
import { ContentSection } from "./ContentSection.component";

const meta: Meta<typeof ContentSection> = {
	component: ContentSection,
	title: "Atoms/Content Section",
};
export default meta;

type Story = StoryObj<typeof ContentSection>;

export const Default: Story = {
	args: {
		children: <p>Poll content goes here.</p>,
	},
};

export const WithCategoryTheme: Story = {
	args: {
		categoryCode: "react",
		children: <p>React category content.</p>,
	},
};
