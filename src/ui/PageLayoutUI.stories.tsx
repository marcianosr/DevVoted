import type { Meta, StoryObj } from "@storybook/react";
import { PageLayoutUI } from "./PageLayoutUI.component";

const meta: Meta<typeof PageLayoutUI> = {
	component: PageLayoutUI,
	title: "UI/PageLayoutUI",
};
export default meta;

type Story = StoryObj<typeof PageLayoutUI>;

export const Default: Story = {
	args: {
		footer: (
			<footer className="p-4 bg-zinc-900 text-white text-center">Footer</footer>
		),
		children: <div className="p-8">Page content</div>,
	},
};
