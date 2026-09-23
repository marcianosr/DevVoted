import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FireAuditInput } from "~/modules/run/incident/application/incident.validation";
import { fireAudit } from "~/modules/run/incident/application/incident.serverfn";
import { attackTargetsQueryKey } from "~/modules/run/incident/application/useAttackTargets.hook";
import { incidentsFeedQueryKey } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { todaysRunQueryKey } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * Fires the armed attack. A success carries the new run view (the credit is
 * spent), so it is committed like any run action; success or refusal, the
 * offers are re-read, because a refusal means the field moved.
 */
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
