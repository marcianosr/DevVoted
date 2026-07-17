import type { Meta, StoryObj } from "@storybook/react";

import { CommunityAnswers } from "./CommunityAnswers.ui";

const meta: Meta<typeof CommunityAnswers> = {
	component: CommunityAnswers,
	title: "Session Run/CommunityAnswers",
};
export default meta;

type Story = StoryObj<typeof CommunityAnswers>;

export const MajorityCorrect: Story = {
	args: {
		totalVotes: 1284,
		options: [
			{ id: "a", label: "at(-1)", percentage: 61, correct: true, chosen: true },
			{ id: "b", label: "pop()", percentage: 31 },
			{ id: "c", label: "last()", percentage: 8 },
		],
	},
};

export const PlayerWrongWithCrowd: Story = {
	args: {
		totalVotes: 640,
		options: [
			{ id: "a", label: "useMemo", percentage: 54, chosen: true },
			{ id: "b", label: "useCallback", percentage: 38, correct: true },
			{ id: "c", label: "useRef", percentage: 8 },
		],
	},
};
