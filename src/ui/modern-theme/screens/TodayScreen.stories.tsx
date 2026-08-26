import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

import { TodayScreen, type TodayRun } from "./TodayScreen.ui";

const meta: Meta<typeof TodayScreen> = {
	component: TodayScreen,
	title: "Modern/Screens/Today",
	parameters: { layout: "fullscreen" },
	args: {
		onStart: () => {},
		onResume: () => {},
		dailyPoll: { questions: 5, answeredBy: 8, onAnswer: () => {} },
		community: { runsLive: 8, onOpen: () => {} },
		polls: { ready: true, count: 5 },
	},
};
export default meta;

type Story = StoryObj<typeof TodayScreen>;

const GATES = ALL_SWATCHES.map(({ gate, theme, finish }) => ({
	gate,
	theme,
	finish,
}));

/** Gate 4 is Lavender, so the pip and the track's live cell both wear it. */
const onLavender = (live: boolean): TodayRun => ({
	gateName: ALL_SWATCHES[4].gateName,
	theme: ALL_SWATCHES[4].theme,
	finish: ALL_SWATCHES[4].finish,
	gatesCleared: 4,
	gateCount: VICTORY_GATE,
	days: 6,
	storageKb: 296,
	gates: GATES,
	live,
});

/** A climb in progress with today's segment open — the press resumes it. */
export const Climbing: Story = { args: { run: onLavender(true) } };

/** Today's five are spent. The same press carries the wait, because "when can
 * I play again" is the answer to why it will not move. */
export const PollsSpent: Story = {
	args: {
		run: onLavender(true),
		polls: { ready: false, opensIn: "New polls in 7h 23m" },
	},
};

/** No run going: the row turns into history and offers today's climb instead. */
export const BetweenRuns: Story = { args: { run: onLavender(false) } };

/** Nobody's first climb has a past to report. */
export const NeverClimbed: Story = { args: { run: null } };

/** Between the click and the server's answer. */
export const Starting: Story = { args: { run: null, starting: true } };

/** The server refused the start. */
export const StartRefused: Story = {
	args: {
		run: onLavender(false),
		error: "You already have a run going today.",
	},
};

/** The lonely edge: one poll, one other climber, nothing plural. */
export const QuietDay: Story = {
	args: {
		run: onLavender(true),
		polls: { ready: true, count: 1 },
		dailyPoll: { questions: 1, answeredBy: 1, onAnswer: () => {} },
		community: { runsLive: 1, onOpen: () => {} },
	},
};
