import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FireAuditInput } from "~/modules/run/incident/application/incident.validation";
import { fireAudit } from "~/modules/run/incident/application/incident.serverfn";
import { attackTargetsQueryKey } from "~/modules/run/incident/application/useAttackTargets.hook";
import { incidentsFeedQueryKey } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { todaysRunQueryKey } from "~/modules/run/run/application/useTodaysRun.hook";

export const useFireAudit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: FireAuditInput) => fireAudit({ data }),
		onSuccess: (result) => {
			if (result.success) queryClient.setQueryData(todaysRunQueryKey(), result);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: attackTargetsQueryKey() });
			queryClient.invalidateQueries({ queryKey: incidentsFeedQueryKey() });
		},
	});
};
