import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { ClimbToday } from "~/modules/run/community/presentation/ClimbToday.ui";
import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";
import { RunCommunityBoard } from "~/modules/run/community/presentation/RunCommunity.ui";
import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";

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

	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const backTarget = run?.status === "rewarding" ? "/run/prep" : "/run";
	const climbOn = {
		label: "Back to your run →",
		onClick: () => navigate({ to: backTarget }),
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

	const climb = view?.climb ? <ClimbToday {...view.climb} /> : null;
	const standouts = view ? <StandoutsPanel standouts={view.standouts} /> : null;

	if (!view || view.polls.length === 0) {
		return (
			<Screen
				gateTheme={run?.gateTheme}
				rightAction={climbOn}
				footerNote={footerNote}
			>
				<Stack gap="6" divided>
					{standouts}
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
				{standouts}
				{climb}
				<RunCommunityBoard
					totalPlayers={view.totalPlayers}
					topPercent={view.topPercent}
					polls={view.polls}
				/>
			</Stack>
		</Screen>
	);
};
