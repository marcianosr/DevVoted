import { useQuery } from "@tanstack/react-query";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";

import { getIncidentsFeed } from "~/modules/run/incident/application/incident.serverfn";
import type { IncidentsFeedView } from "~/modules/run/incident/application/incidentsFeed.service";

export const incidentsFeedQueryKey = () =>
	sessionRunQueryKeys.incidents(getTodayDateString());

/** Today's public incident log, the mirror of `useRunCommunity`. */
export const useIncidentsFeed = () => {
	const query = useQuery({
		queryKey: incidentsFeedQueryKey(),
		queryFn: () => getIncidentsFeed(),
	});

	const response = query.data;
	const view: IncidentsFeedView | null =
		response?.success === true ? response.data : null;
	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return { view, isPending: query.isPending, errorMessage };
};
