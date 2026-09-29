import type { Meta, StoryObj } from "@storybook/react";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const noop = () => {};

const CLOCK = "New polls in 7h 23m";
const RUNGS = [
	{ band: "ok", label: "OK", at: "40%" },
	{ band: "healthy", label: "HEALTHY", at: "60%" },
] as const;

const base: TodayScreenProps = {
	swatch: gateSwatchAt(4),
	press: {
		label: "Resume Lavender",
		note: `Poll 3 out of 5 · ${CLOCK}`,
		pollsLeft: 3,
		onPress: noop,
	},
	shop: {
		label: "Shop",
		hint: "Shop · the shop opens when you clear a gate",
		open: false,
		onPress: noop,
	},
	standing: {
		swatches: swatchTrackFor([1, 2, 3], 4),
		line: "gate 4 of 12 · 296 KB stored · 3 of today’s 5 left · they do not carry to tomorrow",
	},
	coverage: { held: 42, demand: 60, rungs: RUNGS },
	community: {
		count: 8,
		detail: "players answered today",
		href: "/run/community",
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
			press={{
				label: "Start today’s climb",
				note: CLOCK,
				pollsLeft: 5,
				onPress: noop,
			}}
			standing={null}
			coverage={null}
			community={{
				count: 1,
				detail: "player answered today",
				href: "/run/community",
			}}
		/>
	),
};

export const PollsReady: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{
				...base.press,
				note: `Poll 1 out of 5 · ${CLOCK}`,
				pollsLeft: 5,
			}}
			coverage={{ held: 0, demand: 60, rungs: RUNGS }}
		/>
	),
};

export const PartAnsweredDay: Story = {
	render: () => <TodayScreen {...base} />,
};

export const AtAGate: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{
				label: "Resume Lavender",
				note: `Poll 5 out of 5 · ${CLOCK}`,
				pollsLeft: 0,
				onPress: noop,
			}}
			shop={{ label: "Shop", open: true, onPress: noop }}
			coverage={{ held: 64, demand: 60, rungs: RUNGS }}
		/>
	),
};

export const WaitingOnMidnight: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{ label: CLOCK, note: "Poll 4 out of 5", pollsLeft: 0 }}
		/>
	),
};

export const RunOver: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{
				label: "Start today’s climb",
				note: CLOCK,
				pollsLeft: 5,
				onPress: noop,
			}}
			standing={{
				swatches: swatchTrackFor([1, 2, 3, 4]),
				line: "gate 4 of 12 · 296 KB banked · today’s 5 polls are ready",
			}}
			coverage={null}
		/>
	),
};

export const RefusedStart: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{
				label: "Start today’s climb",
				note: CLOCK,
				pollsLeft: 5,
				onPress: noop,
			}}
			standing={null}
			coverage={null}
			refusal="You already have a run going today."
		/>
	),
};
