import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { InstallScale } from "./InstallScale.ui";
import { Screen } from "./Screen.ui";
import { UpgradeScale } from "./Upgrades.ui";

const meta: Meta<typeof InstallScale> = {
	component: InstallScale,
	title: "Kanto/InstallScale",
	args: { from: 4, to: 6, perGateKb: 16 },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<InstallScale {...args} />
		</Screen>
	),
};

export default meta;
type Story = StoryObj<typeof InstallScale>;

export const OffTheFreeRung: Story = {};

export const IntoTheTopRung: Story = {
	args: { from: 24, to: 32, perGateKb: 512 },
};

export const OntoAFreeRung: Story = {
	args: { from: 2, to: 4, perGateKb: 0 },
};

export const BillRisesInPlace: Story = {
	args: { from: 12, to: 12, perGateKb: 48 },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:10rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<InstallScale from={8} to={12} perGateKb={64} />
				</Screen>
			))}
		</div>
	),
};

export const UpgradeInPlace: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<UpgradeScale
				from={1}
				to={2}
				changes={[{ from: "+2%", to: "+4%" }]}
				price="64 KB"
			/>
		</Screen>
	),
};

export const UpgradeThatGrowsTheBuild: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<UpgradeScale
				from={1}
				to={3}
				changes={[{ from: "1.25×", to: "1.75×" }]}
				price="32 KB"
				growth={{ from: 4, to: 6, perGateKb: 16 }}
			/>
		</Screen>
	),
};
