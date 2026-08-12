/**
 * Handler for exposed deck functionality.
 * Separated from handlers.ts to avoid DB code leaking to client bundles.
 */
import { getOrCreateExposedDeck } from "~/domains/economy/services/shopOfferings.service";
import { handleApiOperation } from "~/shared/utils/errorHandling";

/**
 * Gets a random exposed config deck from another player.
 * Uses DB-stored daily selection for consistency across all public-config holders.
 */
export const getRandomExposedConfigDeckHandler = async (
	excludeUserId: string,
	date: string
) => {
	return handleApiOperation(async () => {
		return await getOrCreateExposedDeck(date, excludeUserId);
	}, "Failed to get exposed config deck");
};
