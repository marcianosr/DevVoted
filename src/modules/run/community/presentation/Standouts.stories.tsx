import type { Meta, StoryObj } from "@storybook/react";

import type { CommunityStandout } from "~/modules/run/community/application/community.service";
import type { StandoutValue } from "~/modules/run/community/domain/standouts.model";

import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";

const meta: Meta<typeof StandoutsPanel> = {
	component: StandoutsPanel,
	title: "Run/StandoutsPanel",
};
export default meta;

type Story = StoryObj<typeof StandoutsPanel>;

const award = (
	title: string,
	value: StandoutValue,
	id: string,
	displayName: string,
	you = false
): CommunityStandout => ({ voter: { id, displayName, you }, title, value });

const secs = (seconds: number): StandoutValue => ({
	unit: "duration",
	ms: seconds * 1_000,
});
const mins = (minutes: number, seconds: number): StandoutValue =>
	secs(minutes * 60 + seconds);
const count = (amount: number): StandoutValue => ({ unit: "count", amount });
const percent = (amount: number): StandoutValue => ({
	unit: "percent",
	amount,
});
const configs = (amount: number): StandoutValue => ({
	unit: "configs",
	amount,
});
const text = (value: string): StandoutValue => ({ unit: "text", text: value });

const YOU = ["red", "Red", true] as const;

/** The full board: five of today's awards on the left, four of the climb's on the right. */
export const FullDay: Story = {
	args: {
		standouts: [
			award("fastest answer", secs(4), ...YOU),
			award("first to answer", mins(1, 21), ...YOU),
			award("first good", mins(2, 4), "gary", "Gary Oak"),
			award("most CSS polls", count(3), ...YOU),
			award(
				"only one right",
				text("When block level margins…"),
				"koga",
				"Koga"
			),
			{
				...award("deepest gate", text("Soul"), "misty", "Misty Cascade"),
				swatch: { theme: "soul", finish: "flat" },
			},
			award("longest streak", count(14), "lance", "Lance"),
			award("most coverage", percent(21.4), "erika", "Erika Rainbow"),
			award("widest pipeline", configs(7), "sabrina", "Sabrina"),
		],
	},
};

/** Early in the day, before anyone has built a lead worth naming. */
export const QuietMorning: Story = {
	args: {
		standouts: [
			award("fastest answer", secs(12), "brock", "Brock Boulder"),
			award("first to answer", secs(38), "gary", "Gary Oak"),
			{
				...award("deepest gate", text("Cascade"), "gary", "Gary Oak"),
				swatch: { theme: "cascade", finish: "flat" },
			},
		],
	},
};

/** Nothing of yours: the haul summary stays away rather than reading "you took no". */
export const NoneOfYours: Story = {
	args: {
		standouts: [
			award("fastest answer", secs(6), "gary", "Gary Oak"),
			{
				...award("deepest gate", text("Marsh"), "lance", "Lance"),
				swatch: { theme: "marsh", finish: "flat" },
			},
			award("widest pipeline", configs(5), "misty", "Misty Cascade"),
		],
	},
};

/** A clean sweep reads as one, rather than "you took three of three". */
export const CleanSweep: Story = {
	args: {
		standouts: [
			award("fastest answer", secs(3), ...YOU),
			award("longest streak", count(9), ...YOU),
			award("most coverage", percent(18.2), ...YOU),
		],
	},
};

/** A single config reads "1 config", not "1 configs" — the plural is the UI's job now. */
export const SingleConfigPipeline: Story = {
	args: {
		standouts: [award("widest pipeline", configs(1), ...YOU)],
	},
};
