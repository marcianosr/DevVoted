import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel.ui";
import { SCORING_RULE_LABEL, ScoringRule } from "./ScoringRule.ui";
import { Screen } from "./Screen.ui";
import { Tooltip } from "./Tooltip.ui";

const meta: Meta<typeof ScoringRule> = {
	component: ScoringRule,
	title: "Kanto/ScoringRule",
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen gate="cascade" width="narrow" ground="bare">
			<Panel>
				<Panel.Header
					label="Coverage"
					meta={
						<Tooltip
							label={SCORING_RULE_LABEL}
							hint={<ScoringRule />}
							align="end"
							width="wide"
						>
							6.2 of 15 slots
						</Tooltip>
					}
				/>
				<Panel.Body>
					<ScoringRule />
				</Panel.Body>
			</Panel>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof ScoringRule>;

export const TheLadder: Story = {};
