import type { Meta, StoryObj } from "@storybook/react";

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
				<div className="px-3 py-2 text-sm text-zinc-200">live runs</div>
				<div className="px-3 py-2 text-sm text-zinc-200">standouts</div>
			</>
		),
	},
};

export const WithMeta: Story = {
	args: {
		label: "Build",
		meta: "4 of 6 slots",
		children: <div className="px-3 py-2 text-sm text-zinc-200">.js</div>,
	},
};

export const Shut: Story = {
	args: {
		label: "Storage plan",
		meta: "512 KB cap · free",
		defaultOpen: false,
		children: <div className="px-3 py-2 text-sm text-zinc-200">768 KB</div>,
	},
};
