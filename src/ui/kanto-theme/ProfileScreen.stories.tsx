import { useState, type ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	dexAuditsProps,
	dexConfigGroups,
	dexConfigsProps,
	dexControlsProps,
	dexPollsProps,
	dexRunsProps,
	dexSwatchesProps,
} from "~/test/dexRegistry.factory";
import { kantoStanding } from "~/test/kantoCommunity.factory";
import { trackFor } from "~/test/swatchTrack.factory";

import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { DexAudits } from "./DexAudits.ui";
import { DexConfigs } from "./DexConfigs.ui";
import { DexControls } from "./DexControls.ui";
import { DexPolls } from "./DexPolls.ui";
import { DexRuns } from "./DexRuns.ui";
import { DexSwatches } from "./DexSwatches.ui";
import { ProfileCard } from "./ProfileCard.ui";
import { ProfileClimbing } from "./ProfileClimbing.ui";
import { ProfileCollection } from "./ProfileCollection.ui";
import { ProfileRecord } from "./ProfileRecord.ui";
import { EDIT_PROFILE, ProfileScreen } from "./ProfileScreen.ui";
import type { StandingProps } from "./Standing.ui";

const meta: Meta<typeof ProfileScreen> = {
	component: ProfileScreen,
	title: "Kanto/Screens/ProfileScreen",
	parameters: { controls: { disable: true }, layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof ProfileScreen>;

const TABS = [
	{ id: "polls", label: "polls" },
	{ id: "configs", label: "configs" },
	{ id: "controls", label: "services" },
	{ id: "audits", label: "audits" },
	{ id: "swatches", label: "swatches" },
	{ id: "runs", label: "runs" },
	{ id: "appearance", label: "appearance" },
];

const THEME: Record<string, KantoColor> = {
	polls: "cerulean",
	configs: "pallet",
	controls: "seafoam",
	audits: "saffron",
	swatches: "lavender",
	runs: "pewter",
	borders: "fuchsia",
	titles: "viridian",
};

const PANELS: Record<string, ReactNode> = {
	polls: <DexPolls {...dexPollsProps()} />,
	controls: <DexControls {...dexControlsProps()} />,
	audits: <DexAudits {...dexAuditsProps()} />,
	swatches: <DexSwatches {...dexSwatchesProps()} />,
	runs: <DexRuns {...dexRunsProps()} />,
};

const BORDER = "/borders/border-ts-lavender.svg";
const NAME = "marciano_schildmeijer";

const ConfigsPanel = () => {
	const [openInfo, setOpenInfo] = useState<ReadonlySet<string>>(new Set());

	const toggle = (id: string) => {
		const next = new Set(openInfo);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setOpenInfo(next);
	};

	const everyId = dexConfigGroups.flatMap((group) =>
		group.chips.map((chip) => chip.id)
	);

	return (
		<DexConfigs
			{...dexConfigsProps()}
			openInfo={openInfo}
			onToggleInfo={toggle}
			onToggleAll={() =>
				setOpenInfo(new Set(openInfo.size === 0 ? everyId : []))
			}
		/>
	);
};

const Own = ({ start, titles }: { start: string; titles: string[] }) => {
	const [activeId, setActiveId] = useState(start);

	return (
		<ProfileScreen
			card={
				<ProfileCard
					name={NAME}
					borderUrl={BORDER}
					titles={titles}
					trailing={<Button size="sm" tone="ambient" label={EDIT_PROFILE} />}
				/>
			}
			tabs={TABS}
			activeId={activeId}
			onSelect={setActiveId}
			theme={THEME[activeId]}
			archive="8.2 MB archive"
		>
			{activeId === "configs" ? <ConfigsPanel /> : PANELS[activeId]}
		</ProfileScreen>
	);
};

export const Polls: Story = {
	render: () => <Own start="polls" titles={["Git Maintainer"]} />,
};
export const Configs: Story = {
	render: () => <Own start="configs" titles={["Git Maintainer"]} />,
};
export const Services: Story = {
	render: () => <Own start="controls" titles={["Git Maintainer"]} />,
};
export const Audits: Story = {
	render: () => <Own start="audits" titles={["Git Maintainer"]} />,
};
export const Swatches: Story = {
	render: () => <Own start="swatches" titles={["Git Maintainer"]} />,
};
export const Runs: Story = {
	render: () => <Own start="runs" titles={["Git Maintainer"]} />,
};

export const ThreeTitlesWorn: Story = {
	render: () => (
		<Own start="polls" titles={["Git Maintainer", "First Ascent", "Summit"]} />
	),
};

export const NoTitleYet: Story = {
	render: () => <Own start="polls" titles={[]} />,
};

const VISITED_CARD = (
	<ProfileCard
		name="Misty"
		handle="misty"
		photoUrl="/editors/misty.png"
		borderUrl={BORDER}
		titles={["Completer", "Flawless"]}
	/>
);

const RECORD_NOTE =
	"Where they have been, and the gates they took without a wrong answer.";
const COLLECTION_NOTE =
	"Which polls they have seen, and the answers they gave, stay private.";

const visitedSections = (standing?: StandingProps) => (
	<>
		<ProfileRecord
			figures={[
				{ label: "deepest gate", figure: "9 of 13", yours: "you 6 of 13" },
				{ label: "swatches", figure: "5 of 13", yours: "you 3 of 13" },
				{ label: "runs finished", figure: "24" },
			]}
			swatches={trackFor([0, 1, 2, 3, 5])}
			seats={[
				{ category: "CSS", figure: "21 in a row" },
				{ category: "General Frontend", figure: "16 in a row" },
			]}
			meta="reached gate 9"
			note={RECORD_NOTE}
		/>
		<DexRuns {...dexRunsProps()} />
		<ProfileClimbing
			standing={standing}
			meta={standing === undefined ? "nothing open" : "a run is open"}
		/>
		<ProfileCollection
			counts={[
				{ label: "polls", figure: "41 of 96", held: 41, total: 96 },
				{ label: "configs", figure: "12 of 46", held: 12, total: 46 },
				{ label: "titles", figure: "2 of 16", held: 2, total: 16 },
			]}
			meta="completion only · 2.4 MB archive"
			note={COLLECTION_NOTE}
		/>
	</>
);

export const Visited: Story = {
	render: () => (
		<ProfileScreen
			card={VISITED_CARD}
			theme="cerulean"
			sections={visitedSections(kantoStanding())}
		/>
	),
};

export const VisitedWhileResting: Story = {
	render: () => (
		<ProfileScreen
			card={VISITED_CARD}
			theme="cerulean"
			sections={visitedSections()}
		/>
	),
};
