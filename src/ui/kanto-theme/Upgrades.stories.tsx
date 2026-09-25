import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { upgradesFor } from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { Upgrades } from "./Upgrades.ui";

const MOORES_LAW = upgradesFor({ ...CONFIGS.mooresLaw, level: 2 });

const meta: Meta<typeof Upgrades> = {
	component: Upgrades,
	title: "Kanto/Upgrades",
	args: MOORES_LAW,
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<Upgrades {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Upgrades>;

export const MooresLaw: Story = {};

export const Untouched: Story = { args: upgradesFor(CONFIGS.mooresLaw) };

export const OneFromTheTop: Story = {
	args: upgradesFor({ ...CONFIGS.mooresLaw, level: 4 }),
};

export const OneVersionToBuy: Story = {
	args: upgradesFor({ ...CONFIGS.telemetry, level: 1 }),
};

export const FullyUpgraded: Story = {
	args: upgradesFor({ ...CONFIGS.mooresLaw, level: 5 }),
};

export const NothingOnOffer: Story = {
	args: {
		...MOORES_LAW,
		rungs: MOORES_LAW.rungs.map((rung) =>
			rung.state === "offered" ? { ...rung, state: "future" as const } : rung
		),
	},
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:22rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<Upgrades {...MOORES_LAW} />
				</Screen>
			))}
		</div>
	),
};

const noop = () => {};

export const Buyable: Story = {
	args: { ...MOORES_LAW, onBuy: noop },
};

/** How the panel arrives in play: opened from a chip, and shut from itself. */
export const Closable: Story = {
	args: { ...MOORES_LAW, onBuy: noop, onClose: noop },
};

export const Unaffordable: Story = {
	args: upgradesFor(
		{ ...CONFIGS.mooresLaw, level: 2 },
		{
			storageKb: 32,
			coveragePct: 100,
			onBuy: noop,
		}
	),
};

/** The one refusal KB cannot answer: a focus config wants the coverage first. */
export const CoverageGated: Story = {
	args: upgradesFor(CONFIGS.js, {
		storageKb: 512,
		coveragePct: 2,
		onBuy: noop,
	}),
};
