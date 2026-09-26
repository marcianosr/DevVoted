import {
	removeTitle,
	wearTitle,
	WORN_TITLE_CAP,
	type WearRefusal,
} from "~/modules/account/profile/domain/title.model";
import { fetchArchivedRunStartedAt } from "~/modules/account/profile/infrastructure/legacyRun.repository";
import {
	fetchUnannouncedTitleIds,
	fetchUserTitleState,
	markTitlesAnnounced,
	setEquippedTitles,
} from "~/modules/account/profile/infrastructure/title.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

const NO_SUCH_USER = "User not found";

const REFUSAL_MESSAGE: Record<WearRefusal, string> = {
	unknown: "That title does not exist",
	"not-owned": "Cannot wear a title you have not earned",
	"already-worn": "You are already wearing that title",
	"at-cap": `You can wear ${WORN_TITLE_CAP} titles at once`,
};

export const getTitleStateService = async (userId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserTitleState(userId);
		if (!state) throw new Error(NO_SUCH_USER);

		return state;
	}, "getTitleState");

export const wearTitleService = async (userId: string, titleId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserTitleState(userId);
		if (!state) throw new Error(NO_SUCH_USER);

		const decision = wearTitle(
			state.equippedTitleIds,
			titleId,
			state.ownedTitleIds
		);
		if (decision.kind === "refused") {
			throw new Error(REFUSAL_MESSAGE[decision.reason]);
		}

		const next = await setEquippedTitles(userId, decision.worn);
		if (!next) throw new Error(REFUSAL_MESSAGE["not-owned"]);

		return next;
	}, "wearTitle");

export const removeTitleService = async (userId: string, titleId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserTitleState(userId);
		if (!state) throw new Error(NO_SUCH_USER);

		const next = await setEquippedTitles(
			userId,
			removeTitle(state.equippedTitleIds, titleId)
		);
		if (!next) throw new Error(NO_SUCH_USER);

		return next;
	}, "removeTitle");

export type TitleAnnouncement = {
	readonly titleIds: readonly string[];
	readonly archivedRunStartedAt: string | null;
};

const NOTHING_TO_ANNOUNCE: TitleAnnouncement = {
	titleIds: [],
	archivedRunStartedAt: null,
};

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
