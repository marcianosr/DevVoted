import { createServerFn } from "@tanstack/react-start";

import { getAuthenticatedUserId } from "~/utils/authorization";

import { getPolldexHandler } from "./handlers";

/**
 * Polldex: the viewer's lifetime collection across every published poll.
 * userId comes from the session, never the client — the page is per-user.
 */
export const getPolldex = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getPolldexHandler({ userId });
	}
);
