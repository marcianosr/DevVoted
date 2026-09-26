import { createServerFn } from "@tanstack/react-start";

import { getAuthenticatedUserId } from "~/shared/utils/authorization";

import { getPolldexService } from "~/modules/collection/dex/application/polldex.service";

export const getPolldex = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getPolldexService({ userId });
	}
);
