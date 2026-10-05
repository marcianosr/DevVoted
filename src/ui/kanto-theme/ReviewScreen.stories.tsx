import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateAnswers,
	kantoReview,
	kantoReviewAllOpen,
	kantoReviewAt,
	kantoReviewFlawless,
} from "~/test/kantoGate.factory";

import { ReviewScreen } from "./ReviewScreen.ui";

const meta: Meta<typeof ReviewScreen> = {
	component: ReviewScreen,
	title: "Kanto/Screens/ReviewScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof ReviewScreen>;

export const Reviewed: Story = {
	render: () => <ReviewScreen {...kantoReview()} />,
};

export const AllOpen: Story = {
	render: () => <ReviewScreen {...kantoReviewAllOpen()} />,
};

export const Flawless: Story = {
	render: () => <ReviewScreen {...kantoReviewFlawless()} />,
};

const MISTY = { userId: "misty", name: "Misty" };
const BROCK = { userId: "brock", name: "Brock" };

const answersWithIds = kantoGateAnswers.map((answer, index) => ({
	...answer,
	pollId: String(index),
}));

const votesFor = (options: readonly string[]) =>
	options.map((label, index) => ({
		label,
		count: index === 0 ? 2 : index === 1 ? 1 : 0,
		climbers: index === 0 ? [MISTY, BROCK] : index === 1 ? [BROCK] : [],
	}));

export const WhoPickedWhat: Story = {
	render: () => (
		<ReviewScreen
			{...kantoReviewAt({
				gate: 4,
				answers: answersWithIds,
				open: true,
				votes: new Map(
					answersWithIds.map((answer) => [
						answer.pollId,
						votesFor(answer.options),
					])
				),
			})}
		/>
	),
};
