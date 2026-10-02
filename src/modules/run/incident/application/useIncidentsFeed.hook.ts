import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";

import { getIncidentsFeed } from "~/modules/run/incident/application/incident.serverfn";
import type { IncidentsFeedView } from "~/modules/run/incident/application/incidentsFeed.service";

export const useIncidentsFeed = () =>
	useApiQuery<IncidentsFeedView>({
		queryKey: sessionRunQueryKeys.todaysIncidents(),
		queryFn: () => getIncidentsFeed(),
	});
