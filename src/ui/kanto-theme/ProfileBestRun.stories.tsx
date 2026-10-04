import type { Meta, StoryObj } from "@storybook/react";

import { trackFor } from "~/test/swatchTrack.factory";

import { ProfileBestRun } from "./ProfileBestRun.ui";

const meta: Meta<typeof ProfileBestRun> = {
	component: ProfileBestRun,
	title: "Kanto/Profile/ProfileBestRun",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileBestRun>;

export const HeldAtCinnabar: Story = {
	args: {
		meta: "reached gate 9",
		run: {
			label: "25 Dec",
			swatches: trackFor([0, 1, 3]),
			outcome: "Cinnabar held",
			coverage: "11%",
			band: "danger",
			href: "/runs/42",
		},
	},
};

export const TookTheChampion: Story = {
	args: {
		meta: "reached gate 13",
		run: {
			label: "13 May",
			swatches: trackFor([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
			outcome: "champion",
			coverage: "100%",
			band: "perfect",
			href: "/runs/7",
		},
	},
};
