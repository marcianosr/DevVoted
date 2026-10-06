import type { Meta, StoryObj } from "@storybook/react";

import { PollDetail } from "./PollDetail.ui";

const meta: Meta<typeof PollDetail> = {
	component: PollDetail,
	title: "Polls/PollDetail",
	args: {
		id: 1,
		number: "#1",
		category: "CSS",
		status: "published",
		created: "4 Oct 2026",
		question: {
			answerType: "single",
			question:
				"Which value of `position` removes an element from normal flow and anchors it to the nearest positioned ancestor?",
			options: [
				{ id: "1", letter: "A", label: "absolute" },
				{ id: "2", letter: "B", label: "relative" },
				{ id: "3", letter: "C", label: "sticky" },
				{ id: "4", letter: "D", label: "static" },
			],
		},
		author: { name: "Marciano Schildmeijer", userId: "marciano" },
		explanation:
			"`absolute` takes the box out of flow and places it against the nearest ancestor that is not `static`.",
		canEdit: true,
		editHref: "/polls/1/edit",
		listHref: "/polls",
		view: "player",
		onView: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof PollDetail>;

export const AsAPlayer: Story = {};

export const WithTheAnswer: Story = {
	args: {
		view: "answer",
		question: {
			answerType: "single",
			question:
				"Which value of `position` removes an element from normal flow and anchors it to the nearest positioned ancestor?",
			options: [
				{ id: "1", letter: "A", label: "absolute", state: "right" },
				{ id: "2", letter: "B", label: "relative", state: "idle" },
				{ id: "3", letter: "C", label: "sticky", state: "idle" },
				{ id: "4", letter: "D", label: "static", state: "idle" },
			],
		},
	},
};
