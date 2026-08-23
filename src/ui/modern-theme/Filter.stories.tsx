import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Filter, FilterSelect, type FilterOption } from "./Filter.ui";

const meta: Meta<typeof Filter> = {
	component: Filter,
	title: "Modern/Filter",
	decorators: [
		(Story) => (
			<div className="max-w-3xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Filter>;

const OPTIONS: readonly FilterOption[] = [
	{ id: "seen", label: "seen", count: "23" },
	{ id: "mastered", label: "mastered", count: "14" },
	{ id: "fumbled", label: "fumbled", count: "9" },
	{ id: "all", label: "all", count: "418" },
];

const CATEGORIES = [
	{ id: "any", label: "any category" },
	{ id: "typescript", label: "typescript" },
	{ id: "css", label: "css" },
];

const Narrowing = () => {
	const [activeId, setActiveId] = useState("seen");
	const [category, setCategory] = useState("any");

	return (
		<div className="flex flex-wrap items-center gap-3">
			<Filter
				options={OPTIONS}
				activeId={activeId}
				onSelect={setActiveId}
				label="How much of a poll you have seen"
			/>
			<FilterSelect
				options={CATEGORIES}
				value={category}
				onChange={setCategory}
				label="Category"
			/>
		</div>
	);
};

export const Pills: Story = { render: () => <Narrowing /> };

export const Uncounted: Story = {
	args: {
		options: [
			{ id: "all", label: "all" },
			{ id: "mine", label: "mine" },
		],
		activeId: "all",
		onSelect: () => {},
		label: "Owner",
	},
};
