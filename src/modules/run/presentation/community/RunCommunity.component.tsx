import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
import { getRunCommunity } from "~/modules/run/api/run";
import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { useTodaysRun } from "../game/useTodaysRun.hook";
import { ClimbToday } from "./ClimbToday.ui";
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

	// A locked run has nothing to climb to until tomorrow's segment drops, so the
	// way out is disabled until then — /run would bounce straight back here. The
	// countdown stands beside it rather than inside it: "when do new polls land"
	// is worth knowing on any visit, not only the one that finds you stuck.
	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const climbOn = {
		label: "Back to your run →",
		onClick: () => navigate({ to: "/run" }),
		disabled: waitingForTomorrow,
		hint: waitingForTomorrow
			? "Today’s polls are spent. Your run picks up when the next segment drops at midnight."
			: undefined,
	};
	const footerNote = countdown.isOpen ? undefined : countdown.label;

	if (community.isPending) {
		return (
			<Screen
				gateTheme={run?.gateTheme}
				rightAction={climbOn}
				footerNote={footerNote}
			>
				<Paragraph>Loading today’s comparison…</Paragraph>
			</Screen>
		);
	}

	const view = community.data?.success === true ? community.data.data : null;

	// The map outlives the board: it has something to say from the moment a run
	// exists, including before the day's first answer.
	const climb = view?.climb ? <ClimbToday {...view.climb} /> : null;

	if (!view || view.polls.length === 0) {
		return (
			<Screen
				gateTheme={run?.gateTheme}
				rightAction={climbOn}
				footerNote={footerNote}
			>
				<Stack gap="6" divided>
					{climb}
					<Stack gap="4">
						<Title>Today’s polls</Title>
						<Paragraph>
							Nothing to see yet — answer some of today’s polls first.
						</Paragraph>
					</Stack>
				</Stack>
			</Screen>
		);
	}

	return (
		<Screen
			gateTheme={run?.gateTheme}
			rightAction={climbOn}
			footerNote={footerNote}
		>
			<Stack gap="6" divided>
				{climb}
				<RunCommunityBoard
					totalPlayers={view.totalPlayers}
					topPercent={view.topPercent}
					standouts={view.standouts}
					polls={view.polls}
				/>
			</Stack>
		</Screen>
	);
};
