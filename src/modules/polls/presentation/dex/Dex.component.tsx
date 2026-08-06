import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { pollQueryKeys, userQueryKeys } from "~/domains/shared/queryKeys";
import { getOwnedSwatches } from "~/modules/run/api/run";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ALL_SWATCHES } from "~/modules/run/gate/swatch.model";
import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { getPolldex } from "../../api/polldex";
import {
	filterPolldexEntries,
	polldexCoverage,
	presentCategories,
	type PolldexCategoryFilter,
} from "../../polldex/polldex.model";
import { PolldexPanel } from "../polldex/PolldexPanel.ui";
import { ConfigdexPanel } from "./ConfigdexPanel.ui";
import { DexScreen } from "./DexScreen.ui";
import { SwatchdexPanel } from "./SwatchdexPanel.ui";

type DexProps = {
	// Only the query-cache discriminator; the server derives auth server-side.
	userId: string;
};

/** Tier 2 wiring for the Dex (DVTD-rpl9): tab + query + filter state. */
export const Dex = ({ userId }: DexProps) => {
	const [activeTab, setActiveTab] = useState("polls");
	const [selectedCategory, setSelectedCategory] =
		useState<PolldexCategoryFilter>("all");

	const polldex = useQuery({
		queryKey: pollQueryKeys.polldex(userId),
		queryFn: () => getPolldex(),
	});

	const swatches = useQuery({
		queryKey: userQueryKeys.swatches(userId),
		queryFn: () => getOwnedSwatches(),
	});
	const ownedSwatchIds = swatches.data?.success
		? swatches.data.data.ownedSwatchIds
		: [];

	if (polldex.isPending) {
		return (
			<Screen width="wide">
				<Title>Dex</Title>
				<Paragraph tone="muted">Loading your collection…</Paragraph>
			</Screen>
		);
	}

	if (!polldex.data?.success) {
		return (
			<Screen width="wide">
				<Title>Dex</Title>
				<Paragraph tone="cinnabar">
					Couldn’t load your collection. Try again shortly.
				</Paragraph>
			</Screen>
		);
	}

	const { entries } = polldex.data.data;
	const coverage = polldexCoverage(entries);
	const configCount = Object.keys(CONFIGS).length;

	return (
		<DexScreen
			tabs={[
				{
					id: "polls",
					label: "Polls",
					count: `${coverage.seen}/${coverage.total}`,
				},
				{
					id: "configs",
					label: "Configs",
					// No unlock system yet — owned == total.
					count: `${configCount}/${configCount}`,
				},
				{
					id: "swatches",
					label: "Swatches",
					count: `${ownedSwatchIds.length}/${ALL_SWATCHES.length}`,
				},
			]}
			activeTab={activeTab}
			onSelectTab={setActiveTab}
		>
			{activeTab === "polls" && (
				<PolldexPanel
					entries={filterPolldexEntries(entries, selectedCategory)}
					categories={presentCategories(entries)}
					selectedCategory={selectedCategory}
					onSelectCategory={setSelectedCategory}
				/>
			)}
			{activeTab === "configs" && <ConfigdexPanel />}
			{activeTab === "swatches" && (
				<SwatchdexPanel ownedSwatchIds={ownedSwatchIds} />
			)}
		</DexScreen>
	);
};
