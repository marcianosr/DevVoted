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

import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { DexAudits } from "./DexAudits.ui";
import { DexConfigs } from "./DexConfigs.ui";
import { DexControls } from "./DexControls.ui";
import { DexPolls } from "./DexPolls.ui";
import { DexRuns } from "./DexRuns.ui";
import { DexSwatches } from "./DexSwatches.ui";
import { ProfileCard } from "./ProfileCard.ui";
import { ProfileScreen } from "./ProfileScreen.ui";

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
	{ id: "borders", label: "borders" },
	{ id: "titles", label: "titles" },
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
					trailing={<Button size="sm" tone="ambient" label="edit profile" />}
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

export const Visited: Story = {
	render: () => (
		<ProfileScreen
			card={
				<ProfileCard
					name="Misty"
					handle="misty"
					photoUrl="/editors/misty.png"
					borderUrl={BORDER}
					titles={["Completer", "Flawless"]}
				/>
			}
			theme="cerulean"
			totals={[
				"41 of 96 polls",
				"12 of 30 configs",
				"7 of 13 gates",
				"2.4 MB archive",
			]}
		/>
	),
};
