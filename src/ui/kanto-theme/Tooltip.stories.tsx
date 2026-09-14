import type { Meta, StoryObj } from "@storybook/react";

import { PanelV2 } from "./PanelV2.ui";
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
			<PanelV2>
				<PanelV2.Header
					label="Coverage"
					meta={
						<Tooltip label={SCORING_RULE_LABEL} hint={<ScoringRule />}>
							34/55 correct
						</Tooltip>
					}
				/>
				<PanelV2.Body>
					<Typography variant="hint">
						Hover or tab to the reading to see what a correct answer is worth.
					</Typography>
				</PanelV2.Body>
			</PanelV2>
		</Screen>
	),
};

export const NothingToExplain: Story = {
	render: () => (
		<Screen theme="pewter" width="narrow">
			<PanelV2>
				<PanelV2.Header
					label="Coverage"
					meta={<Tooltip label={SCORING_RULE_LABEL}>34/55 correct</Tooltip>}
				/>
				<PanelV2.Body>
					<Typography variant="hint">
						With no rule to explain, the reading is handed back bare: no
						trigger, no underline, nothing to hover.
					</Typography>
				</PanelV2.Body>
			</PanelV2>
		</Screen>
	),
};
