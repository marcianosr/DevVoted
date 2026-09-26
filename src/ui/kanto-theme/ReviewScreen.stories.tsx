import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoReview,
	kantoReviewAllOpen,
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
