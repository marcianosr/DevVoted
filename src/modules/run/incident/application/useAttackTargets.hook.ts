import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";

import type { AttackTargetsView } from "~/modules/run/incident/application/attackTargets.service";
import { getAttackTargets } from "~/modules/run/incident/application/incident.serverfn";

export const attackTargetsQueryKey = () =>
	sessionRunQueryKeys.attackTargets(getTodayDateString());

/** Offers are dealt per day, but the field is live, so a stale deal is re-read within the hour. */
const OFFERS_STALE_MS = 5 * 60_000;

/**
 * The rivals an armed attack may be aimed at. Reads nothing while nothing is
 * armed: the panel's empty state needs no rival.
 */
export const useAttackTargets = (armed: boolean) => {
	const result = useApiQuery<AttackTargetsView>({
		queryKey: attackTargetsQueryKey(),
		queryFn: () => getAttackTargets(),
		enabled: armed,
		staleTime: OFFERS_STALE_MS,
	});

	return { ...result, isPending: armed && result.isPending };
};
