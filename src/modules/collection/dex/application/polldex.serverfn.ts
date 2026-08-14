import { createServerFn } from "@tanstack/react-start";

import { getAuthenticatedUserId } from "~/shared/utils/authorization";

import { getPolldexService } from "~/modules/collection/dex/application/polldex.service";

/**
 * Polldex: the viewer's lifetime collection across every published poll.
 * userId comes from the session, never the client — the page is per-user.
 */
export const getPolldex = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getPolldexService({ userId });
	}
);
