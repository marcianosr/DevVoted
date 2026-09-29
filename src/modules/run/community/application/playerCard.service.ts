import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { primaryTitleName } from "~/modules/account/profile/domain/title.model";
import { fetchPublicProfile } from "~/modules/account/profile/infrastructure/profile.repository";
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
		const [profile, climber, bestCategories] = await Promise.all([
			fetchPublicProfile(userId),
			fetchActiveClimberFor(userId),
			fetchBestCategories([userId]),
		]);
		if (!profile) throw new Error("User not found");

		const borderUrl = borderUrlOf(profile.equippedBorderId);
		const title = primaryTitleName(profile.equippedTitleIds);

		return {
			userId,
			displayName: profile.displayName,
			...(profile.photoUrl === null ? {} : { photoUrl: profile.photoUrl }),
			...(borderUrl === null ? {} : { borderUrl }),
			...(title === null ? {} : { title }),
			...(climber === null
				? {}
				: { run: runOf(climber, bestCategories.get(userId)) }),
		};
	}, "getPlayerCard");
