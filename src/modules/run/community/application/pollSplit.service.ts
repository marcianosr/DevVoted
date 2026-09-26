import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { showsSampleSize } from "~/modules/run/config/domain/config.model";
import { peekerFor } from "~/modules/run/build/domain/build.model";
import {
	type PollSplit,
	toPollSplit,
} from "~/modules/run/community/domain/pollSplit.model";
import { fetchPollSplit } from "~/modules/run/community/infrastructure/community.repository";
import {
	findActiveSessionRun,
	loadRunState,
} from "~/modules/run/run/infrastructure/run.repository";

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

		const peeker = peekerFor(state.build.configs);
		if (!peeker) throw new Error("No installed config reads the community");

		return toPollSplit(await fetchPollSplit(pollId), {
			withSampleSize: showsSampleSize(peeker),
		});
	}, "getPollSplit");
