import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { headlineFigureOf } from "~/modules/run/config/domain/config.model";

import { Figure } from "./Figure.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Figure> = {
	component: Figure,
	title: "Modern/Figure",
};
export default meta;

type Story = StoryObj<typeof Figure>;

export const Rate: Story = {
	args: { figure: { kind: "multiplier", value: 1.25 } },
};
export const Coverage: Story = {
	args: { figure: { kind: "coverage", value: 0.5 } },
};
export const Storage: Story = { args: { figure: { kind: "kb", value: 16 } } };
export const Interest: Story = {
	args: { figure: { kind: "percent", value: 2 } },
};

const SHOWN = [
	CONFIGS.js,
	CONFIGS.codeCoverage,
	CONFIGS.coldStart,
	CONFIGS.length,
	CONFIGS.mooresLaw,
	CONFIGS.freemium,
	CONFIGS.dependabot,
	CONFIGS.eslint,
	CONFIGS.prefetch,
];

/** Every kind against a real config, ending on the two that lead with no number
 * at all — a switch has nothing to state. */
export const AcrossTheRoster: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{SHOWN.map((config) => (
				<div key={config.id} className="flex items-center gap-3">
					<Text size="meta">{config.label}</Text>
					<Figure figure={headlineFigureOf(config)} />
				</div>
			))}
		</div>
	),
};
