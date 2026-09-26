import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	configSizes,
	infoFor,
	kantoRunningConfigs,
	kantoSkippedConfigs,
	upgradesFor,
} from "~/test/kantoPoll.factory";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { abArmLabel } from "~/modules/run/config/domain/config.model";

import { KANTO_COLORS } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Screen } from "./Screen.ui";

const noop = () => {};

const ROSTER = [
	...kantoRunningConfigs,
	...kantoSkippedConfigs,
] satisfies ConfigChipProps[];

const UNLOCKED_COUNT = 6;
const COLUMN = "flex flex-col items-start gap-3";

const GRID = "grid gap-3 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]";

const OneOpen = ({
	configs,
	layout = COLUMN,
}: {
	configs: readonly ConfigChipProps[];
	layout?: string;
}) => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<div className={layout}>
			{configs.map((config, index) => {
				if (config.locked) return <ConfigChip key={index} locked />;

				return (
					<ConfigChip
						key={config.name}
						{...config}
						infoOpen={config.name === open}
						onToggleInfo={() =>
							setOpen(config.name === open ? undefined : config.name)
						}
					/>
				);
			})}
		</div>
	);
};

const ArmToggle = () => {
	const [coverage, setCoverage] = useState(true);
	const arm = coverage ? "coverage" : "storage";

	return (
		<ConfigChip
			name="A/B Test"
			badges={[
				{
					label: `arm ${abArmLabel(arm)}`,
					armed: true,
					hint: `A/B Test · switch to arm ${abArmLabel(coverage ? "storage" : "coverage")}`,
					onPress: () => setCoverage(!coverage),
				},
				coverage
					? { label: "×1.25", color: "viridian" }
					: { label: "+8 KB", color: "viridian" },
			]}
			info={infoFor(CONFIGS.abTest)}
		/>
	);
};

const Pinnable = (props: ConfigChipProps) => {
	const [open, setOpen] = useState(
		props.locked !== true && props.infoOpen === true
	);

	if (props.locked) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...props}
			infoOpen={open}
			onToggleInfo={() => setOpen(!open)}
		/>
	);
};

const meta: Meta<typeof ConfigChip> = {
	component: ConfigChip,
	title: "Kanto/ConfigChip",
	argTypes: {
		lost: { control: "boolean" },
		skipped: { control: "boolean" },
		infoOpen: { control: "boolean" },
		badges: { control: "object" },
	},
	args: {
		name: "Cache",
		version: 4,
		badges: [{ label: "×1.75", color: "viridian" }],
		info: infoFor(CONFIGS.cache),
	},
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<Pinnable {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof ConfigChip>;

export const Default: Story = {};

export const InfoPinned: Story = { args: { infoOpen: true } };

export const NoInfo: Story = { args: { info: undefined } };

export const Lost: Story = {
	args: {
		name: "Intellisense",
		version: undefined,
		badges: [{ label: "424", color: "cinnabar" }],
		lost: true,
		info: infoFor(CONFIGS.intellisense),
	},
};

export const Skipped: Story = {
	args: {
		name: "Cold Start",
		version: undefined,
		badges: [{ label: "spent", color: "pewter" }],
		skipped: true,
		info: infoFor(CONFIGS.coldStart, "the run's cap is spent"),
	},
};

export const Locked: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<ConfigChip locked />
		</Screen>
	),
};

export const WithArmToggle: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<ArmToggle />
		</Screen>
	),
};

export const WithPaidAction: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				<Pinnable
					name="ESLint"
					badges={[
						{
							label: "lint 32 KB",
							hint: "ESLint · cross out a wrong answer · 32 KB",
							onPress: noop,
						},
					]}
					info={infoFor(CONFIGS.eslint)}
				/>
				<Pinnable
					name="Telemetry"
					version={2}
					badges={[
						{
							label: "peek 512 KB",
							disabled: true,
							hint: "Telemetry · peek · 512 KB · not enough storage",
							onPress: noop,
						},
					]}
					info={infoFor({ ...CONFIGS.telemetry, level: 2 })}
				/>
			</div>
		</Screen>
	),
};

export const OnlyOnePanelOpens: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<OneOpen configs={kantoRunningConfigs} />
		</Screen>
	),
};

export const Roster: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<OneOpen configs={ROSTER} />
		</Screen>
	),
};

export const RosterPartlyUnlocked: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<OneOpen
				configs={ROSTER.map((config, position) =>
					position >= UNLOCKED_COUNT ? { locked: true } : config
				)}
			/>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:14rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={COLUMN}>
						<ConfigChip
							name="A/B Test"
							badges={[
								{ label: "arm A", armed: true, onPress: noop },
								{ label: "×1.25", color: "viridian" },
							]}
							info={infoFor(CONFIGS.abTest)}
						/>
						<ConfigChip
							name="Intellisense"
							badges={[{ label: "424", color: "cinnabar" }]}
							lost
							info={infoFor(CONFIGS.intellisense)}
						/>
					</div>
				</Screen>
			))}
		</div>
	),
};

const LADDER_BADGES = [
	{ label: "×2", color: "viridian" },
] satisfies ConfigChipProps["badges"];

const MOORES_LAW = {
	name: "Moore's Law",
	slots: 1,
	version: 2,
	badges: [{ label: "+4%", color: "viridian" }],
	info: infoFor({ ...CONFIGS.mooresLaw, level: 2 }),
	upgrades: upgradesFor({ ...CONFIGS.mooresLaw, level: 2 }),
} satisfies ConfigChipProps;

const WithPanels = (props: ConfigChipProps) => {
	const [open, setOpen] = useState<"info" | "upgrades" | undefined>(undefined);

	if (props.locked) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...props}
			infoOpen={open === "info"}
			onToggleInfo={() => setOpen(open === "info" ? undefined : "info")}
			upgradesOpen={open === "upgrades"}
			onToggleUpgrades={() =>
				setOpen(open === "upgrades" ? undefined : "upgrades")
			}
		/>
	);
};

export const WithUpgrade: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<WithPanels {...MOORES_LAW} onUninstall={noop} />
		</Screen>
	),
};

export const UpgradeOpen: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<ConfigChip
				{...MOORES_LAW}
				onUninstall={noop}
				upgrades={{ ...MOORES_LAW.upgrades, onBuy: noop }}
				upgradesOpen
			/>
		</Screen>
	),
};

export const UpgradeUnaffordable: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<ConfigChip
				{...MOORES_LAW}
				upgrades={{
					...MOORES_LAW.upgrades,
					onBuy: noop,
					rungs: MOORES_LAW.upgrades.rungs.map((rung) =>
						rung.state === "offered" ? { ...rung, disabled: true } : rung
					),
				}}
				upgradesOpen
			/>
		</Screen>
	),
};

export const WithUninstall: Story = {
	args: { slots: 2, onUninstall: noop },
};

export const InAColumn: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<OneOpen configs={kantoRunningConfigs} />
		</Screen>
	),
};

/** Bodies run one line to four, so the row stretches rather than going ragged. */
export const InAGrid: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<OneOpen configs={kantoRunningConfigs} layout={GRID} />
		</Screen>
	),
};

const NARROW_COLUMN =
	"flex w-70 flex-col gap-3 border border-dashed border-edge";

export const TooNarrowForTheName: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<div className={NARROW_COLUMN}>
				<ConfigChip
					name="Continuous Integration"
					slots={2}
					version={3}
					badges={[{ label: "+96 KB", color: "viridian" }]}
					upgrades={upgradesFor({ ...CONFIGS.unitTests, level: 3 })}
					info={infoFor(CONFIGS.unitTests)}
					onUninstall={noop}
				/>
			</div>
		</Screen>
	),
};

export const EveryWeight: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				{configSizes.map((slots) => (
					<ConfigChip
						key={slots}
						name="Code Coverage"
						slots={slots}
						badges={[...LADDER_BADGES]}
						upgrades={MOORES_LAW.upgrades}
						onUninstall={noop}
					/>
				))}
			</div>
		</Screen>
	),
};

const CROSSING = { from: 6, to: 8, perGateKb: 32 };

/** An install that stays inside the rung already rented: one press, no panel. */
export const OfferedInsideTheRung: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<ConfigChip
				name=".js"
				slots={1}
				badges={[]}
				priceOn="always"
				install={{ price: "32 KB", onPress: noop }}
			/>
		</Screen>
	),
};

/**
 * The same offer once it has been pressed: the press renames itself, takes the
 * colour the kit gives a standing bill, and states what it is about to commit to
 * (ADR-098).
 */
export const ArmedBecauseItCrossesARung: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<ConfigChip
				name=".js"
				slots={1}
				badges={[]}
				priceOn="always"
				install={{
					price: "32 KB",
					onPress: noop,
					scale: CROSSING,
					armed: true,
				}}
			/>
		</Screen>
	),
};
