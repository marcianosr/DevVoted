import { useNavigate } from "@tanstack/react-router";

import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { returnFromCommunity } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { CommunityView } from "~/modules/run/community/presentation/CommunityView.component";
import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import { CommunityScreen } from "~/ui/terminal-theme/screens/CommunityScreen.ui";

/** Tier 2 wiring for the run community page (DVTD-xrpx, terminal skin DVTD-wii3). */
export const RunCommunity = () => {
	const navigate = useNavigate();
	const { view: run } = useTodaysRun();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();

	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const backTarget = returnFromCommunity(run ?? null);
	const back = {
		label: backTarget.label,
		onBack: () => navigate({ to: backTarget.path }),
		disabled: waitingForTomorrow,
		hint: waitingForTomorrow
			? "Today’s polls are spent. Your run picks up when the next segment drops at midnight."
			: undefined,
	};
	const timer = countdown.isOpen ? undefined : countdown.label;

	if (community.isPending) {
		return (
			<CommunityScreen
				theme={run?.gateTheme}
				standouts={[]}
				pollChips={[]}
				pollNote="Loading today’s comparison…"
				countdown={timer}
				back={back}
			/>
		);
	}

	if (community.errorMessage || !community.view) {
		return (
			<CommunityScreen
				theme={run?.gateTheme}
				standouts={[]}
				pollChips={[]}
				pollNote={
					community.errorMessage
						? "Couldn’t load today’s comparison. Your run is unaffected — try again shortly."
						: "Nothing to see yet — answer some of today’s polls first."
				}
				countdown={timer}
				back={back}
			/>
		);
	}

	return (
		<CommunityView
			view={community.view}
			theme={run?.gateTheme}
			countdown={timer}
			back={back}
		/>
	);
};
