import { useQuery } from "@tanstack/react-query";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
import { getRunCommunity } from "~/modules/run/api/run";
import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { RunCommunityBoard } from "./RunCommunity.ui";

/** Tier 2 wiring for the run community page (DVTD-xrpx). */
export const RunCommunity = () => {
	const date = getTodayDateString();

	const community = useQuery({
		queryKey: sessionRunQueryKeys.community(date),
		queryFn: () => getRunCommunity(),
	});

	if (community.isPending) {
		return (
			<Screen>
				<Paragraph>Loading today’s comparison…</Paragraph>
			</Screen>
		);
	}

	const view = community.data?.success === true ? community.data.data : null;

	if (!view || view.polls.length === 0) {
		return (
			<Screen>
				<Title>How you compared</Title>
				<Paragraph>
					Nothing to compare yet — answer some of today’s polls first.
				</Paragraph>
			</Screen>
		);
	}

	return (
		<Screen>
			<RunCommunityBoard
				totalPlayers={view.totalPlayers}
				topPercent={view.topPercent}
				polls={view.polls}
			/>
		</Screen>
	);
};
