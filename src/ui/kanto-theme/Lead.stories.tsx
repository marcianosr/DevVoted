import type { Meta, StoryObj } from "@storybook/react";

import { Lead, type LeadLine } from "./Lead.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";

const SCORE_LINE: LeadLine = [
	"You have scored ",
	{ figure: "6.2", gain: true },
	" out of ",
	{ figure: "15" },
	" slots.",
];

const BAND_LINE: LeadLine = [
	"Close above ",
	{ band: "ok" },
	" and the gate opens; land in ",
	{ band: "danger" },
	" and the run ends.",
];

const meta: Meta<typeof Lead> = {
	component: Lead,
	title: "Kanto/Lead",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen gate="cascade" width="narrow" ground="bare">
			<Panel>
				<Panel.Header label="Coverage" />
				<Panel.Body>
					<Lead {...args} />
				</Panel.Body>
			</Panel>
		</Screen>
	),
	args: { line: SCORE_LINE },
};
export default meta;

type Story = StoryObj<typeof Lead>;

export const AScoreAgainstItsSlots: Story = {};

export const BandsNamedInPlace: Story = { args: { line: BAND_LINE } };

export const AtParagraphSize: Story = {
	args: { line: SCORE_LINE, variant: "paragraph" },
};

export const WordsAlone: Story = {
	args: { line: ["Nothing here is worth boxing."] },
};
