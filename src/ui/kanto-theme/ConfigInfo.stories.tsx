import type { Meta, StoryObj } from "@storybook/react";

import { infoFor } from "~/test/kantoPoll.factory";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { KANTO_COLORS } from "./colors";
import { ConfigInfo } from "./ConfigInfo.ui";
import { Screen } from "./Screen.ui";

const TELEMETRY = infoFor(
	{ ...CONFIGS.telemetry, level: 2 },
	"v2 names the sample size, so 100% of two cannot fool you."
);

const DEPRECATED = infoFor(
	CONFIGS.deprecated,
	"At ×2 now — deleted from the build two clears from here."
);

const meta: Meta<typeof ConfigInfo> = {
	component: ConfigInfo,
	title: "Kanto/ConfigInfo",
	argTypes: {
		slots: { control: { type: "range", min: 1, max: 16 } },
		version: { control: { type: "range", min: 1, max: 5 } },
		maxVersion: { control: { type: "range", min: 1, max: 5 } },
	},
	args: TELEMETRY,
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<ConfigInfo {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof ConfigInfo>;

export const Telemetry: Story = {};

export const Deprecated: Story = { args: DEPRECATED };

export const NoUpgrades: Story = {
	args: infoFor(CONFIGS.abTest),
};

export const NoNote: Story = { args: { ...TELEMETRY, note: undefined } };

export const OneSlot: Story = { args: infoFor(CONFIGS.ts) };

export const LongDescription: Story = {
	args: infoFor(
		CONFIGS.eslint,
		"the fee doubles each use, and resets each gate"
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:18rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<ConfigInfo {...DEPRECATED} />
				</Screen>
			))}
		</div>
	),
};
