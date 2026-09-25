import { findTitleById } from "~/modules/account/profile/domain/title.model";
import { fetchArchivedRunStartedAt } from "~/modules/account/profile/infrastructure/legacyRun.repository";
import {
	fetchUnannouncedTitleIds,
	fetchUserTitleState,
	markTitlesAnnounced,
	setEquippedTitle,
} from "~/modules/account/profile/infrastructure/title.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const getTitleStateService = async (userId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserTitleState(userId);
		if (!state) throw new Error("User not found");

		return state;
	}, "getTitleState");

export const equipTitleService = async (
	userId: string,
	titleId: string | null
) =>
	handleApiOperation(async () => {
		if (titleId !== null && !findTitleById(titleId)) {
			throw new Error(`Title ${titleId} not found`);
		}

		const next = await setEquippedTitle(userId, titleId);
		if (!next) throw new Error("Cannot equip a title you have not earned");

		return next;
	}, "equipTitle");

export type TitleAnnouncement = {
	readonly titleIds: readonly string[];
	readonly archivedRunStartedAt: string | null;
};

const NOTHING_TO_ANNOUNCE: TitleAnnouncement = {
	titleIds: [],
	archivedRunStartedAt: null,
};

/**
 * What this account has been granted and never told about. The archived run is
 * only looked up when there is something to announce, so the common case — an
 * account with nothing pending — costs one query on every navigation.
 */
export const getTitleAnnouncementService = async (userId: string) =>
	handleApiOperation(async () => {
		const titleIds = await fetchUnannouncedTitleIds(userId);
		if (titleIds.length === 0) return NOTHING_TO_ANNOUNCE;

		const startedAt = await fetchArchivedRunStartedAt(userId);
		return {
			titleIds,
			archivedRunStartedAt: startedAt?.toISOString() ?? null,
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
