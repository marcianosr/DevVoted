import type { Meta, StoryObj } from "@storybook/react";

import { swatchTrackFor } from "~/modules/run/gate/application/swatchTrack.viewmodel";

import { ProfileHero, type HeroRecord } from "./ProfileHero.ui";

const RECORD: HeroRecord = {
	stats: [
		{ label: "deepest gate", value: "9 / 13" },
		{ label: "runs played", value: "24" },
		{ label: "runs won", value: "2" },
		{ label: "best streak", value: "21 in a row" },
		{ label: "best category", value: "CSS" },
		{ label: "archived", value: "8.2 MB", color: "saffron" },
	],
};

const SWATCHES = {
	label: "swatches",
	value: "5 / 13",
	fills: swatchTrackFor([0, 1, 2, 4, 6]),
};

const meta: Meta<typeof ProfileHero> = {
	component: ProfileHero,
	title: "Kanto/Profile/ProfileHero",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileHero>;

export const YourOwn: Story = {
	args: {
		name: "marciano_schildmeijer",
		handle: "marciano",
		borderUrl: "/borders/border-ts-lavender.svg",
		titles: ["Git Maintainer", "Summit"],
		contribution: { answered: 10, authored: { role: "Admin", published: 414 } },
		swatches: SWATCHES,
		you: true,
		preview: "preview · not saved",
	},
};

export const SeenByAVisitor: Story = {
	args: {
		name: "Misty",
		handle: "misty",
		photoUrl: "/editors/misty.png",
		titles: ["Completer"],
		contribution: { answered: 120 },
		swatches: SWATCHES,
		record: RECORD,
	},
};

export const BrandNew: Story = {
	args: {
		name: "Brock",
	},
};
