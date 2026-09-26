import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";

import type { AttackTargetsView } from "~/modules/run/incident/application/attackTargets.service";
import { getAttackTargets } from "~/modules/run/incident/application/incident.serverfn";

export const attackTargetsQueryKey = () =>
	sessionRunQueryKeys.attackTargets(getTodayDateString());

const OFFERS_STALE_MS = 5 * 60_000;

export const useAttackTargets = (armed: boolean) => {
	const result = useApiQuery<AttackTargetsView>({
		queryKey: attackTargetsQueryKey(),
		queryFn: () => getAttackTargets(),
		enabled: armed,
		staleTime: OFFERS_STALE_MS,
	});

	return { ...result, isPending: armed && result.isPending };
};
