import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { Figures } from "./Figures.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const LINE = "flex flex-wrap items-center gap-1.5 text-sm text-theme-faint";

const meta: Meta<typeof Figures> = {
	component: Figures,
	title: "Kanto/Figures",
	args: { text: "All coverage earns ×3, fading ×0.5 each gate clear." },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<p className={LINE}>
				<Figures {...args} />
			</p>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Figures>;

export const GainsAndTerms: Story = {};

export const Losses: Story = {
	args: { text: "Leaking −16 KB a poll, and −32 KB on a miss." },
};

export const NoFigures: Story = {
	args: { text: "Cross out a wrong answer for an escalating fee." },
};

export const Categories: Story = {
	args: {
		text: "Cross out a wrong answer on JavaScript / TypeScript polls for an escalating fee.",
	},
};

export const SameFigureBothTones: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<Typography variant="hint">effect line</Typography>
			<p className={LINE}>
				<Figures text="All coverage earns ×2." />
			</p>
			<Typography variant="hint">state line</Typography>
			<p className={LINE}>
				<Figures text="At ×2 now." gain="saffron" />
			</p>
		</Screen>
	),
};

export const EveryToken: Story = {
	args: { text: "×3 and 2× and +0.5 and +8 KB and −16 KB and +25% and ×0.5" },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:8rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<p className={LINE}>
						<Figures text="Earns ×3, fading ×0.5, burning −16 KB." />
					</p>
				</Screen>
			))}
		</div>
	),
};
