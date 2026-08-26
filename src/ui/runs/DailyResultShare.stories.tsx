import type { Meta, StoryObj } from "@storybook/react";

import { buildDailyResultShare } from "~/domains/runs/utils/buildDailyResultShare";

import { DailyResultShare } from "./DailyResultShare.ui";

// The preview is generated from the real pure builder + mock data, proving the
// whole pipeline renders with no server.
const strongDay = buildDailyResultShare({
	dayNumber: 64,
	pipeline: [true, true, true, true, false],
	gateNumber: 3,
	gateCleared: true,
	coverage: [
		{ label: "JS", ratio: 0.8 },
		{ label: "CSS", ratio: 0.6 },
		{ label: "Git", ratio: 0.4 },
	],
	streakDays: 7,
	percentile: 82,
	todayCategory: "React",
	hardPct: 63,
});

const roughDayNoStreak = buildDailyResultShare({
	dayNumber: 64,
	pipeline: [true, false],
	gateNumber: 1,
	gateCleared: false,
	coverage: [
		{ label: "TS", ratio: 0.3 },
		{ label: "Git", ratio: 0.2 },
		{ label: "CSS", ratio: 0.1 },
	],
	percentile: 41,
	todayCategory: "Ruby",
	hardPct: 78,
});

const meta: Meta<typeof DailyResultShare> = {
	component: DailyResultShare,
	title: "Runs/DailyResultShare",
	args: {
		copied: false,
		onCopy: () => {},
		onShare: () => {},
	},
	decorators: [
		(Story) => (
			<div className="max-w-xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DailyResultShare>;

export const StrongDay: Story = {
	args: { preview: strongDay },
};

export const Copied: Story = {
	args: { preview: strongDay, copied: true },
};

// Even a rough, streak-less day still reads as worth sharing — ego-safety rule 2.
export const RoughDayNoStreak: Story = {
	args: { preview: roughDayNoStreak },
};
