import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { pollQueryKeys } from "~/domains/shared/queryKeys";
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
import { PolldexScreen } from "./PolldexScreen.ui";

type PolldexProps = {
	// Only the query-cache discriminator; the server derives auth server-side.
	userId: string;
};

/** Tier 2 wiring for the Polldex (DVTD-rpl9): query + filter/search state. */
export const Polldex = ({ userId }: PolldexProps) => {
	const [selectedCategory, setSelectedCategory] =
		useState<PolldexCategoryFilter>("all");

	const polldex = useQuery({
		queryKey: pollQueryKeys.polldex(userId),
		queryFn: () => getPolldex(),
	});

	if (polldex.isPending) {
		return (
			<Screen width="wide">
				<Title>Polldex</Title>
				<Paragraph tone="muted">Loading your collection…</Paragraph>
			</Screen>
		);
	}

	if (!polldex.data?.success) {
		return (
			<Screen width="wide">
				<Title>Polldex</Title>
				<Paragraph tone="cinnabar">
					Couldn’t load your collection. Try again shortly.
				</Paragraph>
			</Screen>
		);
	}

	const { entries } = polldex.data.data;

	return (
		<PolldexScreen
			entries={filterPolldexEntries(entries, selectedCategory)}
			coverage={polldexCoverage(entries)}
			categories={presentCategories(entries)}
			selectedCategory={selectedCategory}
			onSelectCategory={setSelectedCategory}
		/>
	);
};
