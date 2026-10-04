import {
	profileFaceOf,
	type ProfileRecord,
	type ProfileSeat,
	type PublicProfile,
} from "~/modules/account/profile/domain/profile.model";
import { pollsAnsweredIn } from "~/modules/account/profile/domain/rank.model";
import {
	fetchPublicProfile,
	fetchPublishedPollCounts,
} from "~/modules/account/profile/infrastructure/profile.repository";
import { fetchOwnedTitleIds } from "~/modules/account/profile/infrastructure/title.repository";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import {
	gatedex,
	type GatedexEntry,
} from "~/modules/collection/dex/domain/gatedex.model";
import {
	timesSeenOf,
	type PollSighting,
} from "~/modules/collection/dex/domain/polldex.model";
import {
	bestRunIn,
	deepestGateIn,
	runHistory,
	runsWonIn,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import {
	configTallyOf,
	pollTallyOf,
	titleTallyOf,
} from "~/modules/collection/dex/domain/tally.model";
import {
	fetchConfigUnlocksByUser,
	fetchObjectiveProgressByUser,
} from "~/modules/collection/dex/infrastructure/configdex.repository";
import {
	fetchAnsweredCountsByUser,
	fetchPublishedPollCategories,
	fetchSeenCountsByUser,
	type PolldexAnsweredRow,
	type PolldexCategoryRow,
	type PolldexSeenRow,
} from "~/modules/collection/dex/infrastructure/polldex.repository";
import { fetchGateRunsByUser } from "~/modules/collection/dex/infrastructure/runHistory.repository";
import { standingOf } from "~/modules/run/community/domain/standing.model";
import {
	fetchActiveClimberFor,
	fetchBestCategories,
	type ClimberRow,
} from "~/modules/run/community/infrastructure/climbers.repository";
import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import { fetchCategoryBoards } from "~/modules/run/run/infrastructure/categoryLeader.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

const RECENT_RUNS_SHOWN = 5;

const seatsHeldBy = (
	userId: string,
	seats: readonly CategorySeat[]
): readonly ProfileSeat[] =>
	seats.flatMap((seat) => {
		const { leader } = seat;
		if (leader === undefined || leader.userId !== userId) return [];
		return [{ category: seat.category, streak: leader.best }];
	});

type RecordSources = {
	userId: string;
	entries: readonly RunHistoryEntry[];
	gates: readonly GatedexEntry[];
	seats: readonly CategorySeat[];
	climber: ClimberRow | null;
};

const recordOf = ({
	userId,
	entries,
	gates,
	seats,
	climber,
}: RecordSources): ProfileRecord => ({
	deepestGate: Math.max(deepestGateIn(entries), climber?.gate ?? 0),
	gatesTotal: gates.length,
	clearedGates: gates
		.filter((gate) => gate.state === "cleared")
		.map((gate) => gate.gate),
	runsFinished: entries.length,
	runsWon: runsWonIn(entries),
	bestRun: bestRunIn(entries),
	seats: seatsHeldBy(userId, seats),
	recentRuns: entries.slice(0, RECENT_RUNS_SHOWN),
});

const pollSightingsOf = (
	polls: readonly PolldexCategoryRow[],
	seenRows: readonly PolldexSeenRow[],
	answeredRows: readonly PolldexAnsweredRow[]
): readonly PollSighting[] => {
	const viewsByPoll = new Map(
		seenRows.map((row) => [row.pollId, row.timesSeen])
	);
	const answersByPoll = new Map(
		answeredRows.map((row) => [row.pollId, row.answeredCount])
	);
	return polls.map((poll) => ({
		categoryCode: poll.categoryCode,
		timesSeen: timesSeenOf(
			viewsByPoll.get(poll.id) ?? 0,
			answersByPoll.get(poll.id) ?? 0
		),
	}));
};

export const getPublicProfileService = async (userId: string) =>
	handleApiOperation(async () => {
		const [
			profile,
			polls,
			seenRows,
			answeredRows,
			unlocks,
			ownedTitleIds,
			runRows,
			boards,
			climber,
			progress,
			pollCounts,
			bestCategories,
		] = await Promise.all([
			fetchPublicProfile(userId),
			fetchPublishedPollCategories(),
			fetchSeenCountsByUser(userId),
			fetchAnsweredCountsByUser(userId),
			fetchConfigUnlocksByUser(userId),
			fetchOwnedTitleIds(userId),
			fetchGateRunsByUser(userId),
			fetchCategoryBoards(userId),
			fetchActiveClimberFor(userId),
			fetchObjectiveProgressByUser(userId),
			fetchPublishedPollCounts(userId),
			fetchBestCategories([userId]),
		]);
		if (!profile) throw new Error("User not found");

		const entries = runHistory(runRows);

		return {
			...profileFaceOf(profile, pollCounts, pollsAnsweredIn(progress)),
			record: recordOf({
				userId,
				entries,
				gates: gatedex(profile.ownedSwatchIds),
				seats: boards.streak,
				climber,
			}),
			standing:
				climber === null
					? null
					: standingOf(climber, bestCategories.get(userId)),
			totals: {
				polls: pollTallyOf(pollSightingsOf(polls, seenRows, answeredRows)),
				configs: configTallyOf(configdex(unlocks, [])),
				titles: titleTallyOf(ownedTitleIds),
				archivedStorage: profile.archivedStorage,
			},
		} satisfies PublicProfile;
	}, "getPublicProfile");
