import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	DEX_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";
import { dexConfigGroups, dexConfigsProps } from "~/test/dexRegistry.factory";

import { DexConfigs, type DexWeightGroup } from "./DexConfigs.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof DexConfigs> = {
	component: DexConfigs,
	title: "Kanto/DexConfigs",
	parameters: { controls: { disable: true } },
	decorators: [
		(Story) => (
			<Screen theme="pallet">
				<Story />
			</Screen>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DexConfigs>;

const [heavy, light] = dexConfigGroups;

const cardNamed = (name: string) => {
	const card = [...heavy.chips, ...light.chips].find(
		(candidate) => candidate.name === name
	);
	if (card === undefined) throw new Error(`no fixture card named ${name}`);
	return card;
};

const lockedCard = () => {
	const card = light.chips.find((candidate) => candidate.locked === true);
	if (card === undefined) throw new Error("no locked fixture card");
	return card;
};

const groupOf = (
	group: DexWeightGroup,
	chips: DexWeightGroup["chips"]
): DexWeightGroup => ({ ...group, chips });

const Tab = ({ groups }: { groups: readonly DexWeightGroup[] }) => {
	const [flips, setFlips] = useState<ReadonlySet<string>>(new Set());

	const ids = groups.flatMap((group) => group.chips.map((card) => card.id));
	const open = disclosedIn(ids, flips, DEX_CARDS_OPEN);

	return (
		<DexConfigs
			{...dexConfigsProps({ groups })}
			openInfo={open}
			onToggleInfo={(id) => setFlips(toggleDisclosure(flips, id))}
			onToggleAll={() =>
				setFlips(discloseAll(ids, open.size < ids.length, DEX_CARDS_OPEN))
			}
		/>
	);
};

export const Collapsed: Story = {
	render: () => <Tab groups={dexConfigGroups} />,
};

export const GrantedWithLadder: Story = {
	render: () => <Tab groups={[groupOf(light, [cardNamed(".js")])]} />,
};

export const GrantedFlat: Story = {
	render: () => <Tab groups={[groupOf(light, [cardNamed("ESLint")])]} />,
};

export const Earned: Story = {
	render: () => (
		<Tab groups={[groupOf(heavy, [cardNamed("Regression Test")])]} />
	),
};

export const Met: Story = {
	render: () => (
		<Tab groups={[groupOf(heavy, [cardNamed("Planning Poker")])]} />
	),
};

export const Locked: Story = {
	render: () => <Tab groups={[groupOf(light, [lockedCard()])]} />,
};

export const EveryStateOpen: Story = {
	render: () => (
		<DexConfigs
			{...dexConfigsProps()}
			openInfo={
				new Set(
					dexConfigGroups.flatMap((group) => group.chips.map((card) => card.id))
				)
			}
			onToggleInfo={() => {}}
			onToggleAll={() => {}}
		/>
	),
};
