import type { Meta, StoryObj } from "@storybook/react";
import { FooterUI } from "./FooterUI.component";

const meta: Meta<typeof FooterUI> = {
	component: FooterUI,
	title: "Organisms/Footer",
};
export default meta;

type Story = StoryObj<typeof FooterUI>;

export const Loaded: Story = {
	args: {
		pollCount: 142,
		isLoading: false,
		categoryCount: 8,
		configCount: 24,
		lastCommitDate: "13 May 2025",
		statsLink: (
			<a href="/stats" className="underline">
				See all game info stats
			</a>
		),
	},
};

export const Loading: Story = {
	args: {
		pollCount: null,
		isLoading: true,
		categoryCount: 8,
		configCount: 24,
		lastCommitDate: "25 Dec 2024",
		statsLink: (
			<a href="/stats" className="underline">
				See all game info stats
			</a>
		),
	},
};
