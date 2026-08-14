import { findBorderById } from "~/domains/economy/data/borders";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";
import { handleApiOperation } from "~/shared/utils/errorHandling";

import {
	fetchUserArchiveState,
	purchaseBorderTx,
	setEquippedBorder,
} from "./archive.queries";

export const getArchiveStateHandler = async () =>
	handleApiOperation(async () => {
		const userId = await getAuthenticatedUserId();
		const state = await fetchUserArchiveState(userId);

		if (!state) {
			throw new Error("User not found");
		}

		return state;
	});

export const purchaseBorderHandler = async ({
	data,
}: {
	data: { borderId: string };
}) =>
	handleApiOperation(async () => {
		const userId = await getAuthenticatedUserId();
		const border = findBorderById(data.borderId);

		if (!border) {
			throw new Error(`Border ${data.borderId} not found`);
		}

		const next = await purchaseBorderTx(userId, border.id, border.cost);

		if (!next) {
			throw new Error("Purchase failed: insufficient archive or already owned");
		}

		return next;
	});

export const equipBorderHandler = async ({
	data,
}: {
	data: { borderId: string | null };
}) =>
	handleApiOperation(async () => {
		const userId = await getAuthenticatedUserId();

		if (data.borderId !== null) {
			const state = await fetchUserArchiveState(userId);
			if (!state) throw new Error("User not found");
			if (!state.ownedBorderIds.includes(data.borderId)) {
				throw new Error("Cannot equip a border you don't own");
			}
		}

		const next = await setEquippedBorder(userId, data.borderId);
		if (!next) throw new Error("User not found");

		return next;
	});
