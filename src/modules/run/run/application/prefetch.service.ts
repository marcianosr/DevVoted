import type { CategoryCode } from "~/shared/lib/categories";
import { getTomorrowDateString } from "~/shared/lib/dateUtils";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { prefetcherFor } from "~/modules/run/build/domain/build.model";
import {
	findActiveSessionRun,
	loadRunState,
} from "~/modules/run/run/infrastructure/run.repository";
import { fetchSeedCategoriesForDate } from "~/modules/run/run/infrastructure/runPolls.repository";

/**
 * Tomorrow's poll categories, sold to Prefetch holders only. The gate is
 * server-side (the community split's precedent): the information is the whole
 * product, so an open endpoint would hand every client the config's value for
 * free. Fetching is what rolls tomorrow's shared seed early — the sequence is
 * identical for every player, so a holder learns the schedule, never
 * something another player cannot eventually see.
 */
export const getUpcomingCategoriesService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<readonly CategoryCode[]>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		const state = await loadRunState(run.id);
		if (!prefetcherFor(state.build.configs))
			throw new Error("No installed config reads the upcoming draw");

		return fetchSeedCategoriesForDate(getTomorrowDateString());
	});
