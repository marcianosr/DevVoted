import { findBorderById } from "~/modules/account/profile/domain/border.model";
import {
	wearSwatch,
	type SwatchWearRefusal,
} from "~/modules/account/profile/domain/profileTheme.model";
import {
	fetchUserArchiveState,
	purchaseBorderTx,
	setEquippedBorder,
	setEquippedSwatch,
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

const SWATCH_REFUSAL_MESSAGE = {
	unknown: "No such swatch",
	"not-owned": "Cannot wear a swatch you haven't earned",
} satisfies Record<SwatchWearRefusal, string>;

export const equipSwatchService = async (
	userId: string,
	swatchId: string | null
) =>
	handleApiOperation(async () => {
		const state = await fetchUserArchiveState(userId);
		if (!state) throw new Error("User not found");

		const decision = wearSwatch(swatchId, state.ownedSwatchIds);
		if (decision.kind === "refused") {
			throw new Error(SWATCH_REFUSAL_MESSAGE[decision.reason]);
		}

		const next = await setEquippedSwatch(userId, decision.worn);
		if (!next) throw new Error("User not found");

		return next;
	}, "equipSwatch");
