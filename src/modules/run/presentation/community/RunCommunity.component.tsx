import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
import { getRunCommunity } from "~/modules/run/api/run";
import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { useTodaysRun } from "../game/useTodaysRun.hook";
import { RunCommunityBoard } from "./RunCommunity.ui";
import { useNextPollsCountdown } from "./useNextPollsCountdown.hook";

/** Tier 2 wiring for the run community page (DVTD-xrpx). */
export const RunCommunity = () => {
	const date = getTodayDateString();
	const navigate = useNavigate();
	const { view: run } = useTodaysRun();
	const countdown = useNextPollsCountdown();

	const community = useQuery({
		queryKey: sessionRunQueryKeys.community(date),
		queryFn: () => getRunCommunity(),
	});

	// A locked run has nothing to climb to until tomorrow's segment drops, so
	// the continue button becomes the countdown; at midnight it flips back to
	// a working "Climb on →" (the day rollover happens on the next /run load).
	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const climbOn = {
		label: waitingForTomorrow ? countdown.label : "Climb on →",
		onClick: () => navigate({ to: "/run" }),
		disabled: waitingForTomorrow,
	};

	if (community.isPending) {
		return (
			<Screen rightAction={climbOn}>
				<Paragraph>Loading today’s comparison…</Paragraph>
			</Screen>
		);
	}

	const view = community.data?.success === true ? community.data.data : null;

	if (!view || view.polls.length === 0) {
		return (
			<Screen rightAction={climbOn}>
				<Title>Community</Title>
				<Paragraph>
					Nothing to see yet — answer some of today’s polls first.
				</Paragraph>
			</Screen>
		);
	}

	return (
		<Screen rightAction={climbOn}>
			<RunCommunityBoard
				totalPlayers={view.totalPlayers}
				topPercent={view.topPercent}
				standouts={view.standouts}
				polls={view.polls}
			/>
		</Screen>
	);
};
