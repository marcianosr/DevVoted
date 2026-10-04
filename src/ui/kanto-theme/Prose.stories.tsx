import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { Prose } from "./Prose.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const COVERAGE =
	"Every correct answer pays +0.1 units of coverage. No other config multiplies it; only the gate's accuracy does.";
const SERVICE =
	"save your last checkpoint once; each gate asks a higher price to activate it";
const STAKE =
	"partials count · the gate holds otherwise, whatever the meter reads";

const meta: Meta<typeof Prose> = {
	component: Prose,
	title: "Kanto/Prose",
	args: { text: COVERAGE },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Prose {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Prose>;

export const Default: Story = {};

export const WithoutAFigure: Story = {
	args: { text: SERVICE },
};

export const StatingATerm: Story = {
	args: { text: "At ×2 now — deleted two clears on.", gain: "saffron" },
};

export const OneRegisterAcrossThreeScreens: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<Typography variant="title">Code Coverage</Typography>
			<Prose text={COVERAGE} />

			<Typography variant="subtitle">git tag</Typography>
			<Prose text={SERVICE} />

			<Typography variant="title">Get at least 2 right this window</Typography>
			<Prose text={STAKE} />
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:10rem]">
			{KANTO_COLORS.map((name) => (
				<Screen key={name} theme={name} width="narrow">
					<Prose text={COVERAGE} />
				</Screen>
			))}
		</div>
	),
};
