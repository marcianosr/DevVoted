import type {
	ProfileIdentity,
	ProfileRecord,
	ProfileSeat,
	ProfileStanding,
	ProfileTotals,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { profileThemeFor } from "~/modules/account/profile/domain/profileTheme.model";
import { pollsAnsweredIn } from "~/modules/account/profile/domain/rank.model";
import {
	visibleTitles,
	wornTitleNames,
} from "~/modules/account/profile/domain/title.model";
import { fetchPublicProfile } from "~/modules/account/profile/infrastructure/profile.repository";
import { fetchOwnedTitleIds } from "~/modules/account/profile/infrastructure/title.repository";
import {
	configdex,
	grantedCountIn,
} from "~/modules/collection/dex/domain/configdex.model";
import {
	gatedex,
	type GatedexEntry,
} from "~/modules/collection/dex/domain/gatedex.model";
import {
	deepestGateIn,
	runHistory,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import {
	fetchConfigUnlocksByUser,
	fetchObjectiveProgressByUser,
} from "~/modules/collection/dex/infrastructure/configdex.repository";
import {
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
} from "~/modules/collection/dex/infrastructure/polldex.repository";
import { fetchGateRunsByUser } from "~/modules/collection/dex/infrastructure/runHistory.repository";
import {
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	fetchActiveClimberFor,
	fetchBestCategories,
	type ClimberRow,
} from "~/modules/run/community/infrastructure/climbers.repository";
import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import { fetchCategoryBoards } from "~/modules/run/run/infrastructure/categoryLeader.repository";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";
import { handleApiOperation } from "~/shared/utils/errorHandling";

const RECENT_RUNS_SHOWN = 5;

export type PublicProfile = {
	readonly identity: ProfileIdentity;
	readonly record: ProfileRecord;
	readonly standing: ProfileStanding | null;
	readonly totals: ProfileTotals;
	readonly theme: SwatchTheme;
};

const seatsHeldBy = (
	userId: string,
	seats: readonly CategorySeat[]
): readonly ProfileSeat[] =>
	seats.flatMap((seat) => {
		const { leader } = seat;
		if (leader === undefined || leader.userId !== userId) return [];
		return [{ category: seat.category, streak: leader.best }];
	});

const standingOf = (
	climber: ClimberRow | null,
	bestCategory: string | undefined
): ProfileStanding | null =>
	climber === null
		? null
		: {
				...(bestCategory === undefined ? {} : { bestCategory }),
				gate: climber.gate,
				band: climber.closingBand,
				coveragePercent: Math.round(
					percentOf(runCoverageOf(climber.coverageUnits, climber.gate))
				),
				streak: climber.streak,
				storageKb: climber.storageKb,
				build: climber.build,
			};

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
	seats: seatsHeldBy(userId, seats),
	recentRuns: entries.slice(0, RECENT_RUNS_SHOWN),
});

export const getPublicProfileService = async (userId: string) =>
	handleApiOperation(async () => {
		const profile = await fetchPublicProfile(userId);
		if (!profile) throw new Error("User not found");

		const [
			polls,
			seenRows,
			unlocks,
			ownedTitleIds,
			runRows,
			boards,
			climber,
			progress,
		] = await Promise.all([
			fetchPublishedPollsForDex(),
			fetchSeenCountsByUser(userId),
			fetchConfigUnlocksByUser(userId),
			fetchOwnedTitleIds(userId),
			fetchGateRunsByUser(userId),
			fetchCategoryBoards(userId),
			fetchActiveClimberFor(userId),
			fetchObjectiveProgressByUser(userId),
		]);
		const bestCategories = await fetchBestCategories([userId]);

		const configs = configdex(unlocks, []);
		const gates = gatedex(profile.ownedSwatchIds);
		const entries = runHistory(runRows);

		return {
			identity: {
				displayName: profile.displayName,
				githubUsername: profile.githubUsername,
				photoUrl: profile.photoUrl,
				borderUrl: borderUrlOf(profile.equippedBorderId),
				wornTitles: wornTitleNames(profile.equippedTitleIds),
				pollsAnswered: pollsAnsweredIn(progress),
			},
			theme: profileThemeFor(profile.equippedSwatchId, profile.ownedSwatchIds),
			record: recordOf({
				userId,
				entries,
				gates,
				seats: boards.streak,
				climber,
			}),
			standing: standingOf(climber, bestCategories.get(userId)),
			totals: {
				pollsSeen: seenRows.length,
				pollsTotal: polls.length,
				configsHeld: grantedCountIn(configs),
				configsTotal: configs.length,
				titlesOwned: ownedTitleIds.length,
				titlesTotal: visibleTitles(ownedTitleIds).length,
				archivedStorage: profile.archivedStorage,
			},
		} satisfies PublicProfile;
	}, "getPublicProfile");
