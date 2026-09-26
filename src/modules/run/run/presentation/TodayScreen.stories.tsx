import type { Meta, StoryObj } from "@storybook/react";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayRun,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const noop = () => {};

const onLavender: TodayRun = {
	title: "Your run is on Lavender",
	standing: "gate 4 of 12 · 296 KB stored",
	swatches: swatchTrackFor([1, 3], 4),
	pollsNote: "today’s 5 polls are ready",
};

const base: TodayScreenProps = {
	swatch: gateSwatchAt(4),
	run: onLavender,
	action: { label: "Resume", onPress: noop },
	polls: {
		detail: "5 questions, shared by everyone · 8 have answered",
		press: { label: "Answer it", onPress: noop },
	},
	community: {
		detail: "see how everyone else is doing today",
		press: { label: "Open board", onPress: noop },
	},
};

const meta: Meta<typeof TodayScreen> = {
	component: TodayScreen,
	title: "Kanto/Screens/TodayScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof TodayScreen>;

export const FreshPlayer: Story = {
	render: () => (
		<TodayScreen
			{...base}
			swatch={gateSwatchAt(0)}
			run={null}
			action={{ label: "Start today’s climb", onPress: noop }}
		/>
	),
};

export const PollsReady: Story = { render: () => <TodayScreen {...base} /> };

export const PartAnsweredDay: Story = {
	render: () => (
		<TodayScreen
			{...base}
			run={{
				...onLavender,
				pollsNote: "3 of today’s 5 left · they do not carry to tomorrow",
			}}
			action={{ label: "Resume", onPress: noop }}
		/>
	),
};

export const WaitingOnMidnight: Story = {
	render: () => (
		<TodayScreen
			{...base}
			run={{ ...onLavender, pollsNote: "New polls in 7h 23m" }}
			action={{ label: "New polls in 7h 23m" }}
		/>
	),
};

export const RunOver: Story = {
	render: () => (
		<TodayScreen
			{...base}
			run={{
				...onLavender,
				title: "Your last run reached Lavender",
				standing: "gate 4 of 12 · 296 KB banked",
			}}
			action={{ label: "Start today’s climb", onPress: noop }}
		/>
	),
};
