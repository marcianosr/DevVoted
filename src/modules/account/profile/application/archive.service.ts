import { findBorderById } from "~/modules/account/profile/domain/border.model";
import {
	fetchUserArchiveState,
	purchaseBorderTx,
} from "~/modules/account/profile/infrastructure/profile.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

const NO_SUCH_USER = "User not found";
const PURCHASE_FAILED =
	"Purchase failed: insufficient archive or already owned";

export const getArchiveStateService = async (userId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserArchiveState(userId);
		if (!state) throw new Error(NO_SUCH_USER);

		return state;
	}, "getArchiveState");

export const purchaseBorderService = async (userId: string, borderId: string) =>
	handleApiOperation(async () => {
		const border = findBorderById(borderId);
		if (!border) throw new Error(`Border ${borderId} not found`);

		const next = await purchaseBorderTx(userId, border.id, border.cost);
		if (!next) throw new Error(PURCHASE_FAILED);

		return next;
	}, "purchaseBorder");
