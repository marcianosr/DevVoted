import { useQuery } from "@tanstack/react-query";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";

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
	const query = useQuery({
		queryKey: attackTargetsQueryKey(),
		queryFn: () => getAttackTargets(),
		enabled: armed,
		staleTime: OFFERS_STALE_MS,
	});

	const response = query.data;
	const view: AttackTargetsView | null =
		response?.success === true ? response.data : null;
	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return { view, isPending: armed && query.isPending, errorMessage };
};
