import { isGrantedTitleId } from "~/modules/account/profile/domain/title.model";
import {
	fetchArchivedRunStartedAt,
	fetchLegacyBonusBytes,
} from "~/modules/account/profile/infrastructure/legacy.repository";
import {
	fetchUnannouncedTitleIds,
	fetchUserTitleState,
	markTitlesAnnounced,
} from "~/modules/account/profile/infrastructure/title.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";
import { pollsAnsweredIn } from "~/modules/account/profile/domain/rank.model";
import { fetchObjectiveProgressByUser } from "~/modules/collection/dex/infrastructure/configdex.repository";
import { fetchCategoryPollCounts } from "~/modules/run/run/infrastructure/accountGrant.repository";

const NO_SUCH_USER = "User not found";

export const getTitleStateService = async (userId: string) =>
	handleApiOperation(async () => {
		const [state, progress, categoryPolls] = await Promise.all([
			fetchUserTitleState(userId),
			fetchObjectiveProgressByUser(userId),
			fetchCategoryPollCounts(userId),
		]);
		if (!state) throw new Error(NO_SUCH_USER);

		return {
			...state,
			pollsAnswered: pollsAnsweredIn(progress),
			counts: [...progress, ...categoryPolls],
		};
	}, "getTitleState");

export type TitleAnnouncement = {
	readonly titleIds: readonly string[];
	readonly archivedRunStartedAt: string | null;
	readonly legacyBonusBytes: number | null;
};

const NOTHING_TO_ANNOUNCE: TitleAnnouncement = {
	titleIds: [],
	archivedRunStartedAt: null,
	legacyBonusBytes: null,
};

export const getTitleAnnouncementService = async (userId: string) =>
	handleApiOperation(async () => {
		const unannounced = await fetchUnannouncedTitleIds(userId);
		const titleIds = unannounced.filter(isGrantedTitleId);
		if (titleIds.length === 0) return NOTHING_TO_ANNOUNCE;

		const [startedAt, legacyBonusBytes] = await Promise.all([
			fetchArchivedRunStartedAt(userId),
			fetchLegacyBonusBytes(userId),
		]);
		return {
			titleIds,
			archivedRunStartedAt: startedAt?.toISOString() ?? null,
			legacyBonusBytes,
		} satisfies TitleAnnouncement;
	}, "getTitleAnnouncement");

export const acknowledgeTitlesService = async (
	userId: string,
	titleIds: readonly string[]
) =>
	handleApiOperation(async () => {
		await markTitlesAnnounced(userId, titleIds);
		return { acknowledged: titleIds };
	}, "acknowledgeTitles");
