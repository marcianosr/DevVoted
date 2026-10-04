import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	dexConfigCards,
	dexConfigDetail,
	dexConfigFilters,
	dexConfigRow,
	dexConfigsProps,
} from "~/test/dexRegistry.factory";

import { DexConfigs, type DexConfigCard } from "./DexConfigs.ui";
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

const ALL = "all";

const cardNamed = (name: string): DexConfigCard => {
	const card = dexConfigCards.find((candidate) => candidate.name === name);
	if (card === undefined) throw new Error(`no fixture card named ${name}`);
	return card;
};

const cardWithId = (id: string): DexConfigCard => {
	const card = dexConfigCards.find((candidate) => candidate.id === id);
	if (card === undefined) throw new Error(`no fixture card ${id}`);
	return card;
};

const slotsOf = (card: DexConfigCard) => card.slots ?? 1;

const keptBy = (filter: string) =>
	filter === ALL
		? dexConfigCards
		: dexConfigCards.filter((card) => String(slotsOf(card)) === filter);

const Tab = ({ start }: { start: DexConfigCard }) => {
	const [filter, setFilter] = useState(ALL);
	const [pick, setPick] = useState(start.id);

	const shown = keptBy(filter);
	const picked = shown.find((card) => card.id === pick) ?? shown[0];

	return (
		<DexConfigs
			{...dexConfigsProps({
				filters: dexConfigFilters(),
				filter,
				rows: shown.map(dexConfigRow),
				selectedId: picked === undefined ? null : picked.id,
				detail: picked === undefined ? null : dexConfigDetail(picked),
			})}
			onSelect={setPick}
			onFilter={setFilter}
		/>
	);
};

export const GrantedWithLadder: Story = {
	render: () => <Tab start={cardNamed(".js")} />,
};

export const GrantedFlat: Story = {
	render: () => <Tab start={cardNamed("ESLint")} />,
};

export const Earned: Story = {
	render: () => <Tab start={cardNamed("Regression Test")} />,
};

export const Met: Story = {
	render: () => <Tab start={cardNamed("Planning Poker")} />,
};

export const Locked: Story = {
	render: () => <Tab start={cardWithId("lock")} />,
};

export const Narrowed: Story = {
	render: () => (
		<DexConfigs
			{...dexConfigsProps({
				filter: "1",
				rows: keptBy("1").map(dexConfigRow),
				selectedId: "html",
				detail: dexConfigDetail(cardWithId("html")),
			})}
		/>
	),
};

export const NothingAtThisWeight: Story = {
	render: () => (
		<DexConfigs
			{...dexConfigsProps({
				filter: "8",
				rows: [],
				selectedId: null,
				detail: null,
			})}
		/>
	),
};
