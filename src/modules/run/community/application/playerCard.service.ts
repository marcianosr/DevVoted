import { authorshipOf } from "~/modules/account/profile/domain/authorship.model";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { profileThemeFor } from "~/modules/account/profile/domain/profileTheme.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import {
	fetchPublicProfile,
	fetchPublishedPollCounts,
} from "~/modules/account/profile/infrastructure/profile.repository";
import {
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import type {
	PlayerCardView,
	PlayerRun,
} from "~/modules/run/community/application/playerCard.viewmodel";
import {
	type ClimberRow,
	fetchActiveClimberFor,
	fetchBestCategories,
} from "~/modules/run/community/infrastructure/climbers.repository";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

const runOf = (
	climber: ClimberRow,
	bestCategory: string | undefined
): PlayerRun => ({
	gate: climber.gate,
	coveragePercent: Math.round(
		percentOf(runCoverageOf(climber.coverageUnits, climber.gate))
	),
	streak: climber.streak,
	storageKb: climber.storageKb,
	build: climber.build,
	...(bestCategory === undefined ? {} : { bestCategory }),
});

export const getPlayerCardService = async (
	userId: string
): Promise<ApiResponse<PlayerCardView>> =>
	handleApiOperation(async () => {
		const [profile, climber, bestCategories, pollCounts] = await Promise.all([
			fetchPublicProfile(userId),
			fetchActiveClimberFor(userId),
			fetchBestCategories([userId]),
			fetchPublishedPollCounts(userId),
		]);
		if (!profile) throw new Error("User not found");

		const borderUrl = borderUrlOf(profile.equippedBorderId);

		return {
			userId,
			displayName: profile.displayName,
			...(profile.photoUrl === null ? {} : { photoUrl: profile.photoUrl }),
			...(borderUrl === null ? {} : { borderUrl }),
			titles: wornTitleNames(profile.equippedTitleIds),
			theme: profileThemeFor(profile.equippedSwatchId, profile.ownedSwatchIds),
			authorship: authorshipOf(profile.role, pollCounts),
			...(climber === null
				? {}
				: { run: runOf(climber, bestCategories.get(userId)) }),
		};
	}, "getPlayerCard");
