import { useQuery } from "@tanstack/react-query";

import type { CategoryCode } from "~/shared/lib/categories";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";

import { getUpcomingCategories } from "~/modules/run/run/application/run.serverfn";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

/** Structurally matches the UI's UpcomingCategoriesProps — declared here too
 * because application code must not import from presentation. */
type Upcoming = {
	readonly thisGate: readonly CategoryCode[];
	readonly nextGate: readonly CategoryCode[];
};

/**
 * Prefetch's reveal, both halves merged: what the engine already holds (the
 * view's window slices) plus tomorrow's five from the server. The server half
 * joins the window the engine is standing in — after a clear the window has
 * already advanced, so tomorrow's polls fill "this gate" up to the window
 * size before anything lands in "next gate". The query only fires when the
 * config is installed and the engine does not already know the next window
 * (the pool-fed prototype does, and needs no server).
 */
export const useUpcomingCategories = (
	view: RunView | null
): Upcoming | undefined => {
	const thisGateKnown = view?.upcomingCategories ?? null;
	const nextGateKnown = view?.nextGateCategories ?? [];

	const query = useQuery({
		queryKey: sessionRunQueryKeys.upcomingCategories(getTodayDateString()),
		queryFn: () => getUpcomingCategories(),
		enabled: thisGateKnown !== null && nextGateKnown.length === 0,
	});

	if (view === null || thisGateKnown === null) return undefined;

	const response = query.data;
	const tomorrow: readonly CategoryCode[] =
		response?.success === true ? response.data : [];

	const missing = Math.max(
		0,
		view.pollsPerGate - view.pollsAnswered - thisGateKnown.length
	);
	return {
		thisGate: [...thisGateKnown, ...tomorrow.slice(0, missing)],
		nextGate:
			nextGateKnown.length > 0 ? nextGateKnown : tomorrow.slice(missing),
	};
};
