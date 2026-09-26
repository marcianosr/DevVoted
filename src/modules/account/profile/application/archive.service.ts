import { findBorderById } from "~/modules/account/profile/domain/border.model";
import {
	fetchUserArchiveState,
	purchaseBorderTx,
	setEquippedBorder,
} from "~/modules/account/profile/infrastructure/profile.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const getArchiveStateService = async (userId: string) =>
	handleApiOperation(async () => {
		const state = await fetchUserArchiveState(userId);

		if (!state) {
			throw new Error("User not found");
		}

		return state;
	}, "getArchiveState");

export const purchaseBorderService = async (userId: string, borderId: string) =>
	handleApiOperation(async () => {
		const border = findBorderById(borderId);

		if (!border) {
			throw new Error(`Border ${borderId} not found`);
		}

		const next = await purchaseBorderTx(userId, border.id, border.cost);

		if (!next) {
			throw new Error("Purchase failed: insufficient archive or already owned");
		}

		return next;
	}, "purchaseBorder");

export const equipBorderService = async (
	userId: string,
	borderId: string | null
) =>
	handleApiOperation(async () => {
		if (borderId !== null) {
			const state = await fetchUserArchiveState(userId);
			if (!state) throw new Error("User not found");
			if (!state.ownedBorderIds.includes(borderId)) {
				throw new Error("Cannot equip a border you don't own");
			}
		}

		const next = await setEquippedBorder(userId, borderId);
		if (!next) throw new Error("User not found");

		return next;
	}, "equipBorder");
