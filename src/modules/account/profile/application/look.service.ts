import {
	lookRefusalOf,
	storedSwatchOf,
	type Look,
	type LookRefusal,
} from "~/modules/account/profile/domain/look.model";
import { WORN_TITLE_CAP } from "~/modules/account/profile/domain/title.model";
import {
	fetchUserArchiveState,
	setEquippedLook,
} from "~/modules/account/profile/infrastructure/profile.repository";
import { fetchOwnedTitleIds } from "~/modules/account/profile/infrastructure/title.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

const NO_SUCH_USER = "User not found";

const REFUSAL_MESSAGE: Record<LookRefusal, string> = {
	"border-not-owned": "Cannot wear a border you don't own",
	"title-not-owned": "Cannot wear a title you have not earned",
	"title-repeated": "A title can be worn once",
	"over-cap": `You can wear ${WORN_TITLE_CAP} titles at once`,
	"swatch-not-owned": "Cannot wear a swatch you have not earned",
};

export const saveLookService = async (userId: string, look: Look) =>
	handleApiOperation(async () => {
		const [archive, ownedTitleIds] = await Promise.all([
			fetchUserArchiveState(userId),
			fetchOwnedTitleIds(userId),
		]);
		if (!archive) throw new Error(NO_SUCH_USER);

		const refusal = lookRefusalOf(look, {
			ownedBorderIds: archive.ownedBorderIds,
			ownedTitleIds,
			ownedSwatchIds: archive.ownedSwatchIds,
		});
		if (refusal !== null) throw new Error(REFUSAL_MESSAGE[refusal]);

		const saved = await setEquippedLook(userId, {
			...look,
			swatchId: storedSwatchOf(look),
		});
		if (!saved) throw new Error(NO_SUCH_USER);

		return saved;
	}, "saveLook");
