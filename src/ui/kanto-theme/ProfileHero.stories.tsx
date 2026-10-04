import type { Meta, StoryObj } from "@storybook/react";

import { trackFor } from "~/test/swatchTrack.factory";

import { Button } from "./Button.ui";
import { ProfileHero } from "./ProfileHero.ui";
import { EDIT_PROFILE } from "./ProfileScreen.ui";

const meta: Meta<typeof ProfileHero> = {
	component: ProfileHero,
	title: "Kanto/Profile/ProfileHero",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileHero>;

const NOTE = "A swatch is a gate taken at 100% coverage.";

export const YourOwn: Story = {
	args: {
		name: "marciano_schildmeijer",
		handle: "marciano",
		borderUrl: "/borders/border-ts-lavender.svg",
		titles: ["Git Maintainer", "Summit"],
		rank: "Senior",
		you: true,
		trailing: <Button size="sm" tone="ambient" label={EDIT_PROFILE} />,
		trophies: [
			{ label: "deepest gate", figure: "9", outOf: "/ 13" },
			{ label: "swatches", figure: "5", outOf: "/ 13" },
			{ label: "runs won", figure: "2" },
		],
		swatches: trackFor([0, 1, 2, 3, 5]),
		note: NOTE,
	},
};

export const SeenByAVisitor: Story = {
	args: {
		name: "Misty",
		handle: "misty",
		photoUrl: "/editors/misty.png",
		titles: ["Completer"],
		trophies: [
			{ label: "deepest gate", figure: "9", outOf: "/ 13", yours: "you 6" },
			{ label: "swatches", figure: "5", outOf: "/ 13", yours: "you 3" },
			{ label: "runs won", figure: "0" },
		],
		swatches: trackFor([0, 1, 2, 3, 5]),
		note: NOTE,
	},
};

export const BrandNew: Story = {
	args: {
		name: "Brock",
		trophies: [
			{ label: "deepest gate", figure: "0", outOf: "/ 13" },
			{ label: "swatches", figure: "0", outOf: "/ 13" },
			{ label: "runs won", figure: "0" },
		],
		swatches: trackFor([]),
		note: NOTE,
	},
};
