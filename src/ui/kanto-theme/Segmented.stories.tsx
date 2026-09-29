import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { Segmented } from "./Segmented.ui";

const noop = () => {};

const STATUSES = [
	{ value: "all", label: "all", count: 96 },
	{ value: "published", label: "published", count: 92 },
	{ value: "draft", label: "draft", count: 3 },
	{ value: "archived", label: "archived", count: 1 },
];

const CATEGORIES = [
	{ value: "all", label: "All", count: 96 },
	{ value: "css", label: "CSS", count: 8 },
	{ value: "js", label: "JavaScript", count: 8 },
	{ value: "react", label: "React", count: 8 },
	{ value: "ts", label: "TypeScript", count: 8 },
	{ value: "html", label: "HTML", count: 8 },
	{ value: "git", label: "Git", count: 8 },
	{ value: "general-frontend", label: "General Frontend", count: 8 },
	{ value: "java", label: "Java", count: 8 },
];

const meta: Meta<typeof Segmented> = {
	component: Segmented,
	title: "Kanto/Segmented",
	argTypes: { look: { control: "inline-radio", options: ["joined", "loose"] } },
	args: { label: "Status", items: STATUSES, value: "all", onSelect: noop },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Segmented {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Segmented>;

export const Joined: Story = {};

export const JoinedWithoutCounts: Story = {
	args: {
		label: "Answer type",
		items: [
			{ value: "all", label: "any" },
			{ value: "single", label: "single" },
			{ value: "multiple", label: "multiple" },
		],
	},
};

export const Loose: Story = {
	args: { label: "Category", items: CATEGORIES, value: "css", look: "loose" },
};
