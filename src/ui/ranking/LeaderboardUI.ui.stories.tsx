import type { Meta, StoryObj } from "@storybook/react";
import { LeaderboardUI } from "./LeaderboardUI.ui";

const meta: Meta<typeof LeaderboardUI> = {
	component: LeaderboardUI,
	title: "Ranking/Organisms/Leaderboard",
};
export default meta;

type Story = StoryObj<typeof LeaderboardUI>;

const sampleEntries = [
	{
		userId: "1",
		displayName: "Banjo",
		photoUrl: "",
		displayCoverage: 87,
		level: 3,
		gateNumber: 5,
		totalCoverage: 18700,
		bestStreak: 12,
		currentStreak: 4,
		correctPolls: 42,
	},
	{
		userId: "2",
		displayName: "Kazooie",
		role: "poll-editor" as const,
		photoUrl: "",
		displayCoverage: 72,
		level: 2,
		gateNumber: 4,
		totalCoverage: 14400,
		bestStreak: 8,
		currentStreak: 8,
		correctPolls: 31,
	},
	{
		userId: "3",
		displayName: "Mumbo Jumbo",
		photoUrl: "",
		displayCoverage: 55,
		level: 1,
		gateNumber: 3,
		totalCoverage: 5500,
		bestStreak: 5,
		currentStreak: 2,
		correctPolls: 18,
	},
];

export const WithEntries: Story = {
	args: {
		entries: sampleEntries,
		categoryName: "JavaScript",
		isLoading: false,
		isError: false,
	},
};

export const Loading: Story = {
	args: {
		entries: [],
		categoryName: "JavaScript",
		isLoading: true,
		isError: false,
	},
};

export const Error: Story = {
	args: {
		entries: [],
		categoryName: "JavaScript",
		isLoading: false,
		isError: true,
	},
};

export const Empty: Story = {
	args: {
		entries: [],
		categoryName: "TypeScript",
		isLoading: false,
		isError: false,
	},
};
