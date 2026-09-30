import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

import {
	createKantoNewRunScreenProps,
	kantoBootedPanel,
	kantoGateZeroFooter,
	kantoNewRunFilter,
	kantoNewRunRegistry,
	kantoNewRunAt,
	kantoWarmBootPanel,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

const NewRunWithPanels = () => {
	const [buildFlips, setBuildFlips] = useState<ReadonlySet<string>>(new Set());
	const [offerFlips, setOfferFlips] = useState<ReadonlySet<string>>(new Set());

	const buildNames = props.build.configs.map((config) => config.name ?? "");
	const offerNames = props.registry.offers.map((offer) => offer.name ?? "");

	const openBuild = disclosedIn(buildNames, buildFlips, INSTALLED_CARDS_OPEN);
	const openOffers = disclosedIn(offerNames, offerFlips, OFFERED_CARDS_OPEN);

	return (
		<NewRunScreen
			{...props}
			build={{
				...props.build,
				openInfo: openBuild,
				onToggleInfo: (name) =>
					setBuildFlips(toggleDisclosure(buildFlips, name)),
				onToggleAll: () =>
					setBuildFlips(
						discloseAll(
							buildNames,
							openBuild.size < buildNames.length,
							INSTALLED_CARDS_OPEN
						)
					),
			}}
			registry={{
				...props.registry,
				openInfo: openOffers,
				onToggleInfo: (name) =>
					setOfferFlips(toggleDisclosure(offerFlips, name)),
				onToggleAll: () =>
					setOfferFlips(
						discloseAll(
							offerNames,
							openOffers.size < offerNames.length,
							OFFERED_CARDS_OPEN
						)
					),
			}}
		/>
	);
};

const meta: Meta<typeof NewRunScreen> = {
	component: NewRunScreen,
	title: "Kanto/Screens/NewRunScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof NewRunScreen>;

export const NothingPicked: Story = {
	render: () => <NewRunScreen {...props} />,
};

export const WithPanels: Story = { render: () => <NewRunWithPanels /> };

export const OnePicked: Story = {
	render: () => <NewRunScreen {...kantoNewRunAt(["js"])} />,
};

export const BuildFull: Story = {
	render: () => (
		<NewRunScreen {...kantoNewRunAt(["js", "code-coverage", "unit-tests"])} />
	),
};

export const CutToOneGroup: Story = {
	render: () => (
		<NewRunScreen
			{...props}
			registry={kantoNewRunRegistry([], BASE_SLOTS, "coverage")}
			filter={kantoNewRunFilter([], BASE_SLOTS, "coverage")}
		/>
	),
};

export const Unfiltered: Story = {
	render: () => <NewRunScreen {...props} filter={undefined} />,
};

export const Drafted: Story = {
	render: () => (
		<NewRunScreen
			{...kantoNewRunAt(["js"])}
			warmBoot={kantoWarmBootPanel(512, { rung: 1, serviceIds: ["pin"] })}
			footer={{
				...kantoGateZeroFooter(true),
				action: {
					...kantoGateZeroFooter(true).action,
					label: "Pallet gate prep · 384 KB archive",
					tone: "commit",
				},
			}}
		/>
	),
};

export const ArchiveShort: Story = {
	render: () => (
		<NewRunScreen
			{...kantoNewRunAt(["js"])}
			warmBoot={kantoWarmBootPanel(100)}
		/>
	),
};

export const Booted: Story = {
	render: () => (
		<NewRunScreen {...kantoNewRunAt(["js"])} warmBoot={kantoBootedPanel()} />
	),
};

export const Framed: Story = {
	render: () => <NewRunScreen {...props} ground="framed" />,
};
