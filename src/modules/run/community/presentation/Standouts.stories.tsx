import type { Meta, StoryObj } from "@storybook/react";

import type { CommunityStandout } from "~/modules/run/community/application/community.service";

import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";

const meta: Meta<typeof StandoutsPanel> = {
	component: StandoutsPanel,
	title: "Run/StandoutsPanel",
};
export default meta;

type Story = StoryObj<typeof StandoutsPanel>;

const award = (
	title: string,
	value: string,
	id: string,
	displayName: string,
	you = false
): CommunityStandout => ({ voter: { id, displayName, you }, title, value });

const YOU = ["red", "Red", true] as const;

/** The full board: five of today's awards on the left, four of the climb's on the right. */
export const FullDay: Story = {
	args: {
		standouts: [
			award("fastest answer", "4s", ...YOU),
			award("first to answer", "1m21", ...YOU),
			award("first good", "2m04", "gary", "Gary Oak"),
			award("most CSS polls", "3", ...YOU),
			award("only one right", "When block level margins…", "koga", "Koga"),
			{
				...award("deepest gate", "Soul", "misty", "Misty Cascade"),
				swatch: { theme: "soul", finish: "flat" },
			},
			award("longest streak", "14", "lance", "Lance"),
			award("most coverage", "+21.4%", "erika", "Erika Rainbow"),
			award("widest pipeline", "7 configs", "sabrina", "Sabrina"),
		],
	},
};

/** Early in the day, before anyone has built a lead worth naming. */
export const QuietMorning: Story = {
	args: {
		standouts: [
			award("fastest answer", "12s", "brock", "Brock Boulder"),
			award("first to answer", "38s", "gary", "Gary Oak"),
			{
				...award("deepest gate", "Cascade", "gary", "Gary Oak"),
				swatch: { theme: "cascade", finish: "flat" },
			},
		],
	},
};

/** Nothing of yours: the haul summary stays away rather than reading "you took no". */
export const NoneOfYours: Story = {
	args: {
		standouts: [
			award("fastest answer", "6s", "gary", "Gary Oak"),
			{
				...award("deepest gate", "Marsh", "lance", "Lance"),
				swatch: { theme: "marsh", finish: "flat" },
			},
			award("widest pipeline", "5 configs", "misty", "Misty Cascade"),
		],
	},
};

/** A clean sweep reads as one, rather than "you took three of three". */
export const CleanSweep: Story = {
	args: {
		standouts: [
			award("fastest answer", "3s", ...YOU),
			award("longest streak", "9", ...YOU),
			award("most coverage", "+18.2%", ...YOU),
		],
	},
};
