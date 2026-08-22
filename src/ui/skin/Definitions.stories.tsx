import type { Meta, StoryObj } from "@storybook/react";

import { Definitions } from "./Definitions.ui";
import { Subtitle } from "./Subtitle.ui";

// Game-design reason: the poll's provenance is what makes a daily question feel
// authored rather than generated, so it reads as a record, not a caption.
const Panel = () => (
	<div className="w-[26rem] border border-edge bg-surface">
		<Definitions
			items={[
				{
					term: "Poll",
					detail: (
						<>
							lift-the-final-two <Subtitle>#0412</Subtitle>
						</>
					),
				},
				{
					term: "Written by",
					detail: (
						<>
							@matthijsgroen <Subtitle>· contributor · 14 published</Subtitle>
						</>
					),
				},
				{ term: "Category", detail: "typescript" },
				{ term: "Answer type", detail: "single" },
				{
					term: "Difficulty",
					detail: (
						<>
							×1.1 <Subtitle>4 options</Subtitle>
						</>
					),
				},
				{
					term: "Request URL",
					detail: "devvoted://seed/2026-08-20/poll-3",
					tone: "muted",
				},
			]}
		/>
	</div>
);

const meta: Meta<typeof Panel> = {
	component: Panel,
	title: "Skin/Definitions",
};
export default meta;

type Story = StoryObj<typeof Panel>;

export const PollRecord: Story = {};
