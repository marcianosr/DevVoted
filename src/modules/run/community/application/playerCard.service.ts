import { profileFaceOf } from "~/modules/account/profile/domain/profile.model";
import { pollsAnsweredIn } from "~/modules/account/profile/domain/rank.model";
import {
	fetchPublicProfile,
	fetchPublishedPollCounts,
} from "~/modules/account/profile/infrastructure/profile.repository";
import { fetchObjectiveProgressByUser } from "~/modules/collection/dex/infrastructure/configdex.repository";
import {
	type PlayerCardView,
	playerCardViewFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import { standingOf } from "~/modules/run/community/domain/standing.model";
import {
	fetchActiveClimberFor,
	fetchBestCategories,
} from "~/modules/run/community/infrastructure/climbers.repository";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

export const getPlayerCardService = async (
	userId: string
): Promise<ApiResponse<PlayerCardView>> =>
	handleApiOperation(async () => {
		const [profile, pollCounts, progress, climber, bestCategories] =
			await Promise.all([
				fetchPublicProfile(userId),
				fetchPublishedPollCounts(userId),
				fetchObjectiveProgressByUser(userId),
				fetchActiveClimberFor(userId),
				fetchBestCategories([userId]),
			]);
		if (!profile) throw new Error("User not found");

		return playerCardViewFor(
			userId,
			profileFaceOf(profile, pollCounts, pollsAnsweredIn(progress)),
			climber === null ? null : standingOf(climber, bestCategories.get(userId))
		);
	}, "getPlayerCard");
