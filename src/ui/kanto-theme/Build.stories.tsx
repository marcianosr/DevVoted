import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoNewRunRegistry,
	kantoShopWeight,
	createKantoBuildProps,
	kantoRunningConfigs,
	kantoShopBuild,
	kantoSkippedConfigs,
} from "~/test/kantoPoll.factory";

import { Build } from "./Build.ui";
import { Registry } from "./Registry.ui";
import { KANTO_COLORS } from "./colors";
import type { ConfigChipProps } from "./ConfigChip.ui";
import { Screen } from "./Screen.ui";

const EVERY_STATE = [
	{ name: ".ts", version: 4, badges: [{ label: "×2", color: "viridian" }] },
	{ name: "ESLint", badges: [{ label: "lint 32 KB", color: "cerulean" }] },
	{ name: "Dependabot", badges: [{ label: "bump in 2", color: "vermillion" }] },
	{ name: "Deprecated", badges: [{ label: "×2 fading", color: "vermillion" }] },
	{
		name: "Intellisense",
		badges: [{ label: "424", color: "cinnabar" }],
		lost: true,
	},
	{
		name: "Cold Start",
		badges: [{ label: "spent", color: "pewter" }],
		skipped: true,
	},
	{ locked: true },
] satisfies ConfigChipProps[];

const FIRST_GATE = kantoRunningConfigs.slice(0, 2);

const BandWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<Screen theme="vermillion">
			<Build
				{...createKantoBuildProps()}
				openInfo={open}
				onToggleInfo={(name) => setOpen(name === open ? undefined : name)}
			/>
		</Screen>
	);
};

const meta: Meta<typeof Build> = {
	component: Build,
	title: "Kanto/Build",
	argTypes: {
		skippedOpen: { control: "boolean" },
		heading: { control: "boolean" },
	},
	args: createKantoBuildProps(),
	render: (args) => (
		<Screen theme="vermillion">
			<Build {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Build>;

export const Folded: Story = {};

export const Unfolded: Story = { args: { skippedOpen: true } };

export const Headless: Story = {
	args: { heading: false },
};

export const NothingSkipped: Story = {
	args: { skipped: [], skippedNote: undefined },
};

export const JustStarted: Story = {
	args: { configs: FIRST_GATE, skipped: [] },
};

export const EveryState: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<Build configs={EVERY_STATE} />
		</Screen>
	),
};

export const SkippedBesideRunning: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<Build
				configs={kantoRunningConfigs}
				skipped={kantoSkippedConfigs}
				skippedNote="nothing to do on this poll"
				skippedOpen
			/>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:16rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme}>
					<Build configs={EVERY_STATE} />
				</Screen>
			))}
		</div>
	),
};

export const OneInfoOpen: Story = {
	parameters: { controls: { disable: true } },
	render: () => <BandWithPanels />,
};

export const InfoPinnedOnACache: Story = {
	args: { openInfo: "Cache" },
};

export const ShopColumn: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<Build
				configs={kantoShopBuild}
				layout="column"
				slots={{ used: 7, capacity: 10 }}
			/>
		</Screen>
	),
};

export const ShopColumnWithRoom: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<Build
				configs={kantoShopBuild}
				layout="column"
				slots={{ used: 7, capacity: 10 }}
			/>
		</Screen>
	),
};

export const ShopColumnFull: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<Build
				configs={kantoShopBuild}
				layout="column"
				slots={{ used: 10, capacity: 10 }}
			/>
		</Screen>
	),
};

export const UnderAWeightLadder: Story = {
	args: {
		configs: kantoShopBuild,
		layout: "column",
		weight: kantoShopWeight(),
	},
};

export const UnderAWeightLadderHovered: Story = {
	args: {
		configs: kantoShopBuild,
		layout: "column",
		weight: kantoShopWeight(),
		highlight: "Telemetry",
	},
};

export const ReadoutOnly: Story = {
	args: {
		configs: kantoShopBuild,
		layout: "column",
		weight: kantoShopWeight(),
		list: false,
	},
};

export const InstallationsOnly: Story = {
	args: {
		configs: kantoShopBuild,
		layout: "column",
		weight: kantoShopWeight(),
		heading: false,
		readout: false,
	},
};

export const SplitAcrossColumns: Story = {
	render: (args) => (
		<Screen theme="vermillion">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div className="flex w-full min-w-0 flex-col gap-6">
					<Registry {...kantoNewRunRegistry()} />
					<Build {...args} layout="column" list={false} />
				</div>
				<div className="flex w-full min-w-0 flex-col gap-6">
					<Build {...args} layout="column" heading={false} readout={false} />
				</div>
			</div>
		</Screen>
	),
	args: {
		configs: kantoShopBuild,
		weight: kantoShopWeight(),
		emptyLabel: "nothing installed yet",
	},
};
