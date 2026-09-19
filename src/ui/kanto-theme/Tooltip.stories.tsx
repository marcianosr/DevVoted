import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel.ui";
import { SCORING_RULE_LABEL, ScoringRule } from "./ScoringRule.ui";
import { Screen } from "./Screen.ui";
import { Tooltip } from "./Tooltip.ui";
import { Typography } from "./Typography.ui";

const meta: Meta<typeof Tooltip> = {
	component: Tooltip,
	title: "Kanto/Tooltip",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const TheScoringRule: Story = {
	render: () => (
		<Screen theme="cerulean" width="narrow">
			<Panel>
				<Panel.Header
					label="Coverage"
					meta={
						<Tooltip label={SCORING_RULE_LABEL} hint={<ScoringRule />}>
							34/55 correct
						</Tooltip>
					}
				/>
				<Panel.Body>
					<Typography variant="hint">
						Hover or tab to the reading to see what a correct answer is worth.
					</Typography>
				</Panel.Body>
			</Panel>
		</Screen>
	),
};

export const NothingToExplain: Story = {
	render: () => (
		<Screen theme="pewter" width="narrow">
			<Panel>
				<Panel.Header
					label="Coverage"
					meta={<Tooltip label={SCORING_RULE_LABEL}>34/55 correct</Tooltip>}
				/>
				<Panel.Body>
					<Typography variant="hint">
						With no rule to explain, the reading is handed back bare: no
						trigger, no underline, nothing to hover.
					</Typography>
				</Panel.Body>
			</Panel>
		</Screen>
	),
};
