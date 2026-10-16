import type { Meta, StoryObj } from "@storybook/react";

import { ProfileCollection } from "./ProfileCollection.ui";

const meta: Meta<typeof ProfileCollection> = {
	component: ProfileCollection,
	title: "Kanto/Profile/ProfileCollection",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileCollection>;

const NOTE =
	"Which polls they have seen, and the answers they gave, stay private.";

export const Counts: Story = {
	args: {
		counts: [
			{ label: "polls", figure: "41 of 96", held: 41, total: 96 },
			{ label: "configs", figure: "12 of 46", held: 12, total: 46 },
			{ label: "titles", figure: "2 of 16", held: 2, total: 16 },
		],
		meta: "completion only · 2.4 MB archive",
		note: NOTE,
	},
};

export const FreshAccount: Story = {
	args: {
		counts: [
			{ label: "polls", figure: "0 of 96", held: 0, total: 96 },
			{ label: "configs", figure: "7 of 46", held: 7, total: 46 },
			{ label: "titles", figure: "0 of 16", held: 0, total: 16 },
		],
		meta: "completion only · 0 B archive",
		note: NOTE,
	},
};
