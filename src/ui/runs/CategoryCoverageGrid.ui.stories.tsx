import type { Meta, StoryObj } from "@storybook/react";
import { CategoryCoverageGridUI } from "./CategoryCoverageGrid.ui";

const meta: Meta<typeof CategoryCoverageGridUI> = {
	component: CategoryCoverageGridUI,
	title: "Runs/Organisms/Category Coverage Grid",
	decorators: [
		(Story) => (
			<div className="max-w-2xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof CategoryCoverageGridUI>;

const baseEntries = [
	{
		code: "js",
		name: "JavaScript",
		currentCoverage: 42.5,
		currentStreak: 3,
		bestStreak: 7,
		isBestStreak: true,
		isCurrent: false,
	},
	{
		code: "ts",
		name: "TypeScript",
		currentCoverage: 28.0,
		currentStreak: 1,
		bestStreak: 4,
		isBestStreak: false,
		isCurrent: false,
	},
	{
		code: "pokemon",
		name: "Pokémon",
		currentCoverage: 15.3,
		currentStreak: 0,
		bestStreak: 2,
		isBestStreak: false,
		isCurrent: false,
	},
	{
		code: "bk",
		name: "Banjo-Kazooie",
		currentCoverage: 5.0,
		currentStreak: 0,
		bestStreak: 1,
		isBestStreak: false,
		isCurrent: false,
	},
];

export const Default: Story = {
	args: { entries: baseEntries },
};

export const WithCurrentCategory: Story = {
	args: {
		entries: baseEntries.map((e) => ({
			...e,
			isCurrent: e.code === "ts",
		})),
	},
};

export const AllZero: Story = {
	args: {
		entries: baseEntries.map((e) => ({
			...e,
			currentCoverage: 0,
			currentStreak: 0,
			bestStreak: 0,
			isBestStreak: false,
		})),
	},
};
