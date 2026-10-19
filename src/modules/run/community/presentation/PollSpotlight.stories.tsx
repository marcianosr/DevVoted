import type { Meta, StoryObj } from "@storybook/react";

import { PollSpotlight, type PollSpotlightProps } from "./PollSpotlight.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const meta: Meta<typeof PollSpotlight> = {
	component: PollSpotlight,
	title: "Kanto/PollSpotlight",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PollSpotlight>;

const frame = (props: PollSpotlightProps) => (
	<div className="[--screen-floor:14rem]">
		<Screen theme="lavender">
			<PollSpotlight {...props} />
		</Screen>
	</div>
);

const REVIEW = { label: "Review all 5 answers", onReview: () => {} };

export const HardestAndEasiest: Story = {
	render: () =>
		frame({
			title: "Today’s polls",
			spotlights: [
				{
					kind: "hardest",
					question:
						"With dangerouslySetInnerHTML a risk you take, what risk is at stake?",
					rightShare: 29,
					gotIt: [{ name: "Giovanni" }, { name: "Sabrina" }],
				},
				{
					kind: "easiest",
					question:
						"Two, three, four and five hundred, every code has a class, match each range to its meaning before you pass!",
					rightShare: 86,
					gotIt: [],
				},
			],
			review: REVIEW,
		}),
};

export const BeforeAnyPollIsRevealed: Story = {
	render: () =>
		frame({
			title: "Today’s polls",
			spotlights: [],
			empty: "Nothing to see yet — answer some of today’s polls first.",
		}),
};
