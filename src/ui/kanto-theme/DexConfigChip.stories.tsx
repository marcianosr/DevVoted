import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { dexConfigGroups } from "~/test/dexRegistry.factory";

import { DexConfigChip, type DexConfigChipProps } from "./DexConfigChip.ui";
import { Screen } from "./Screen.ui";

const ROW = "flex flex-wrap items-center gap-3";
const [heavy, light] = dexConfigGroups;
const chips = [...heavy.chips, ...light.chips];
const chipNamed = (name: string) => {
	const chip = chips.find(
		(candidate) => candidate.state !== "locked" && candidate.name === name
	);
	if (chip === undefined) throw new Error(`no fixture chip named ${name}`);
	return chip;
};
const lockedChip = (): DexConfigChipProps => {
	const chip = light.chips.find((candidate) => candidate.state === "locked");
	if (chip === undefined) throw new Error("no locked fixture chip");
	return chip;
};

const meta: Meta<typeof DexConfigChip> = {
	component: DexConfigChip,
	title: "Kanto/DexConfigChip",
	parameters: { controls: { disable: true } },
	decorators: [
		(Story) => (
			<Screen theme="pallet" width="narrow">
				<Story />
			</Screen>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DexConfigChip>;

/** Hover reveals the hint; a press pins it. One open at a time, as the Dex does. */
const OneOpen = ({ configs }: { configs: readonly DexConfigChipProps[] }) => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<div className={ROW}>
			{configs.map((config) => (
				<DexConfigChip
					key={config.id}
					{...config}
					infoOpen={config.id === open}
					onToggleInfo={() =>
						setOpen(config.id === open ? undefined : config.id)
					}
				/>
			))}
		</div>
	);
};

export const GrantedWithLadder: Story = {
	render: () => <OneOpen configs={[chipNamed(".js")]} />,
};

export const GrantedFlat: Story = {
	render: () => <OneOpen configs={[chipNamed("ESLint")]} />,
};

export const Earned: Story = {
	render: () => <OneOpen configs={[chipNamed("Regression Test")]} />,
};

/** Met in a shop or a rival's build and not yet earned. Nothing feeds this yet. */
export const Met: Story = {
	render: () => <OneOpen configs={[chipNamed("Planning Poker")]} />,
};

export const Locked: Story = {
	render: () => <OneOpen configs={[lockedChip()]} />,
};

export const InfoPinned: Story = {
	render: () => <DexConfigChip {...chipNamed(".js")} infoOpen />,
};

export const OneRow: Story = {
	render: () => <OneOpen configs={heavy.chips} />,
};
