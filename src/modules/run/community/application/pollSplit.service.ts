import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { showsSampleSize } from "~/modules/run/config/domain/config.model";
import { peekerFor } from "~/modules/run/pipeline/domain/pipeline.model";
import {
	type PollSplit,
	toPollSplit,
} from "~/modules/run/community/domain/pollSplit.model";
import { fetchPollSplit } from "~/modules/run/community/infrastructure/community.repository";
import {
	findActiveSessionRun,
	loadRunState,
} from "~/modules/run/run/infrastructure/run.repository";

/**
 * The split for one poll, sold rather than given: the engine charges the peek and
 * records the poll, and this refuses to answer for any poll that recording does
 * not name. Split off the run's own dispatch on purpose — the reducer is pure and
 * cannot read the community, and a paid peek has to survive a page reload, so the
 * fee and the data are two round trips by design.
 *
 * Correctness never enters this path. The caller has not answered yet, so the
 * response carries option ids and percentages and nothing else.
 */
export const getPollSplitService = async ({
	userId,
	pollId,
}: {
	userId: string;
	pollId: number;
}): Promise<ApiResponse<PollSplit>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		const state = await loadRunState(run.id);
		if (!(state.peekedPollIds ?? []).includes(String(pollId)))
			throw new Error("Nothing paid for on this poll");

		const peeker = peekerFor(state.pipeline.configs);
		// Peeled after paying: the peek is spent, but the config that reads the
		// numbers is gone, so there is nothing installed to show them.
		if (!peeker) throw new Error("No installed config reads the community");

		return toPollSplit(await fetchPollSplit(pollId), {
			withSampleSize: showsSampleSize(peeker),
		});
	});
