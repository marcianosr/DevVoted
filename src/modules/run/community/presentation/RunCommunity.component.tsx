import { useNavigate } from "@tanstack/react-router";

import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import {
	INCIDENTS_DEALING,
	INCIDENTS_UNREADABLE,
	incidentsPanelFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { useIncidentsFeed } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { returnFromCommunity } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { CommunityView } from "~/modules/run/community/presentation/CommunityView.component";
import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";

const SPENT_HINT =
	"Today’s polls are spent. Your run picks up when the next segment drops at midnight.";
const LOADING = "Loading today’s comparison…";
const LOAD_FAILED =
	"Couldn’t load today’s comparison. Your run is unaffected — try again shortly.";

/**
 * Held locally rather than imported from the service: that module reaches its
 * repositories, which would drag the database driver into the browser bundle.
 */
const EMPTY_COMMUNITY: RunCommunityView = {
	date: "",
	totalPlayers: 0,
	topPercent: null,
	leaders: [],
	polls: [],
	climb: null,
};

/** Tier 2 wiring for the run community page (DVTD-xrpx, kanto skin DVTD-6crx). */
export const RunCommunity = () => {
	const navigate = useNavigate();
	const { view: run } = useTodaysRun();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();
	const feed = useIncidentsFeed();

	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const backTarget = returnFromCommunity(run ?? null);
	const back = {
		label: backTarget.label,
		onBack: () => navigate({ to: backTarget.path }),
		disabled: waitingForTomorrow,
		hint: waitingForTomorrow ? SPENT_HINT : undefined,
	};
	const timer = countdown.isOpen ? undefined : countdown.label;
	const swatch = gateSwatchAt(run?.gatesCleared ?? 0);
	const incidents = {
		...incidentsPanelFor(feed.view?.rows ?? []),
		...(feed.isPending ? { empty: INCIDENTS_DEALING } : {}),
		...(feed.errorMessage === null ? {} : { empty: INCIDENTS_UNREADABLE }),
	};
	const shared = {
		swatch,
		countdown: timer,
		back,
		incidents,
		rivals: feed.view?.rivals ?? [],
	};

	if (community.isPending)
		return <CommunityView view={EMPTY_COMMUNITY} note={LOADING} {...shared} />;

	if (community.errorMessage || !community.view)
		return (
			<CommunityView
				view={EMPTY_COMMUNITY}
				note={community.errorMessage ? LOAD_FAILED : NOTHING_TO_COMPARE_YET}
				{...shared}
			/>
		);

	return <CommunityView view={community.view} {...shared} />;
};
