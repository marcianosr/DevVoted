import type { Meta, StoryObj } from "@storybook/react";

import { getCategories } from "~/domains/shared/categories";

import { CategoryTag } from "./CategoryTag.ui";

const meta: Meta<typeof CategoryTag> = {
	component: CategoryTag,
	title: "Polls/CategoryTag",
	decorators: [
		(Story) => (
			<div className="bg-black p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof CategoryTag>;

export const Css: Story = { args: { category: "css", name: "CSS" } };

export const Frontend: Story = {
	args: { category: "general-frontend", name: "General Frontend" },
};

export const EveryCategory: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{getCategories().map(({ code, name }) => (
				<CategoryTag key={code} category={code} name={name} />
			))}
		</div>
	),
};
