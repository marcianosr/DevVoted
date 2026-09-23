import { useNavigate } from "@tanstack/react-router";

import {
	INCIDENTS_DEALING,
	INCIDENTS_UNREADABLE,
	incidentsScreenPropsFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { useIncidentsFeed } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { returnFromCommunity } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { IncidentsScreen } from "~/ui/kanto-theme/IncidentsScreen.ui";

/** Tier 2: today's public incident log, a breather outside the climb like the board (ADR-099). */
export const RunIncidents = () => {
	const navigate = useNavigate();
	const { view: run } = useTodaysRun();
	const feed = useIncidentsFeed();

	const backTarget = returnFromCommunity(run ?? null);
	const props = incidentsScreenPropsFor(feed.view?.rows ?? [], {
		label: backTarget.label,
		onPress: () => navigate({ to: backTarget.path }),
	});

	if (feed.isPending)
		return <IncidentsScreen {...props} empty={INCIDENTS_DEALING} />;
	if (feed.errorMessage !== null)
		return <IncidentsScreen {...props} empty={INCIDENTS_UNREADABLE} />;
	return <IncidentsScreen {...props} />;
};
