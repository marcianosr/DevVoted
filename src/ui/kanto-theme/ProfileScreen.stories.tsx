import { useState, type ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	dexAuditsProps,
	dexConfigsProps,
	dexControlsProps,
	dexPollsProps,
	dexRunsProps,
	dexSwatchesProps,
} from "~/test/dexRegistry.factory";
import { kantoStanding } from "~/test/kantoCommunity.factory";
import { trackFor } from "~/test/swatchTrack.factory";

import { Button } from "./Button.ui";
import { DexAudits } from "./DexAudits.ui";
import { DexConfigs } from "./DexConfigs.ui";
import { DexControls } from "./DexControls.ui";
import { DexPolls } from "./DexPolls.ui";
import { DexRuns } from "./DexRuns.ui";
import { DexSwatches } from "./DexSwatches.ui";
import { ProfileBestRun } from "./ProfileBestRun.ui";
import { ProfileClimbing } from "./ProfileClimbing.ui";
import { ProfileCollection } from "./ProfileCollection.ui";
import { ProfileHero, type Trophy } from "./ProfileHero.ui";
import { EDIT_PROFILE, ProfileScreen } from "./ProfileScreen.ui";
import { ProfileSeats } from "./ProfileSeats.ui";
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

const PANELS: Record<string, ReactNode> = {
	polls: <DexPolls {...dexPollsProps()} />,
	configs: <DexConfigs {...dexConfigsProps()} />,
	controls: <DexControls {...dexControlsProps()} />,
	audits: <DexAudits {...dexAuditsProps()} />,
	swatches: <DexSwatches {...dexSwatchesProps()} />,
	runs: <DexRuns {...dexRunsProps()} />,
};

const BORDER = "/borders/border-ts-lavender.svg";
const NAME = "marciano_schildmeijer";

const trophies = (yours: boolean): Trophy[] => [
	{
		label: "deepest gate",
		figure: "9",
		outOf: "/ 13",
		...(yours ? { yours: "you 6" } : {}),
	},
	{
		label: "swatches",
		figure: "5",
		outOf: "/ 13",
		...(yours ? { yours: "you 3" } : {}),
	},
	{ label: "runs won", figure: "2" },
];

const highlights = (standing?: StandingProps) => (
	<>
		<ProfileBestRun
			meta="reached gate 9"
			run={{
				label: "25 Dec",
				swatches: trackFor([0, 1, 3]),
				outcome: "Cinnabar held",
				coverage: "41%",
				band: "ok",
				href: "/runs/42",
			}}
		/>
		{standing === undefined ? null : <ProfileClimbing {...standing} />}
		<ProfileSeats
			meta="2 seats held"
			seats={[
				{ category: "CSS", figure: "21 in a row" },
				{ category: "General Frontend", figure: "16 in a row" },
			]}
		/>
	</>
);

const Own = ({ start, titles }: { start: string; titles: string[] }) => {
	const [activeId, setActiveId] = useState(start);

	return (
		<ProfileScreen
			hero={
				<ProfileHero
					name={NAME}
					borderUrl={BORDER}
					titles={titles}
					you
					trailing={<Button size="sm" tone="ambient" label={EDIT_PROFILE} />}
					trophies={trophies(false)}
				/>
			}
			highlights={highlights(kantoStanding())}
			tabs={TABS}
			activeId={activeId}
			onSelect={setActiveId}
			theme="pallet"
			archive="8.2 MB archive"
		>
			{PANELS[activeId]}
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

const VISITED_HERO = (
	<ProfileHero
		name="Misty"
		handle="misty"
		photoUrl="/editors/misty.png"
		borderUrl={BORDER}
		titles={["Completer", "Flawless"]}
		trophies={trophies(true)}
	/>
);

const COLLECTION_NOTE =
	"Which polls they have seen, and the answers they gave, stay private.";

const VISITED_SECTIONS = (
	<>
		<DexRuns {...dexRunsProps()} />
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
			hero={VISITED_HERO}
			theme="pallet"
			highlights={highlights(kantoStanding())}
			sections={VISITED_SECTIONS}
		/>
	),
};

export const VisitedWhileResting: Story = {
	render: () => (
		<ProfileScreen
			hero={VISITED_HERO}
			theme="pallet"
			highlights={highlights()}
			sections={VISITED_SECTIONS}
		/>
	),
};
