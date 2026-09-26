import {
	handleApiOperation,
	type ApiResponse,
} from "~/shared/utils/errorHandling";

import { fetchUnlockedServiceIds } from "~/modules/run/shop/infrastructure/serviceUnlock.repository";

export type ServiceUnlocksData = {
	readonly unlockedServiceIds: readonly string[];
};

export const getServiceUnlocksService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<ServiceUnlocksData>> =>
	handleApiOperation(
		async () => ({ unlockedServiceIds: await fetchUnlockedServiceIds(userId) }),
		"getServiceUnlocks"
	);
