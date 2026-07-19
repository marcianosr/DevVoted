import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/lib/dateUtils";
import { getAuthenticatedUserId } from "~/utils/authorization";

import { runActionSchema } from "../validation/schemas.validation";
import { getRunCommunityHandler } from "./community.handlers";
import {
	abandonRunHandler,
	dispatchRunActionHandler,
	getTodaysRunHandler,
	startRunHandler,
} from "./handlers";

/**
 * The trust boundary (DVTD-ay5e): the server owns run state and correctness.
 * Clients send intent (a RunAction) and only ever receive the redacted
 * RunView — never RunState, never option `correct` flags.
 */

export const getTodaysRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getTodaysRunHandler({ userId, date: getTodayDateString() });
	}
);

export const startRun = createServerFn({ method: "POST" }).handler(async () => {
	const userId = await getAuthenticatedUserId();
	return startRunHandler({ userId, date: getTodayDateString() });
});

/** Give up the active run: 50% of leftover storage banks, a fresh start opens (DVTD-li9i). */
export const abandonRun = createServerFn({ method: "POST" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return abandonRunHandler({ userId });
	}
);

/** Community comparison for today's segment — only polls the viewer is past. */
export const getRunCommunity = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getRunCommunityHandler({ userId, date: getTodayDateString() });
	}
);

export const dispatchRunAction = createServerFn({ method: "POST" })
	.validator(z.object({ action: runActionSchema }).strict())
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return dispatchRunActionHandler({
			userId,
			date: getTodayDateString(),
			action: data.action,
		});
	});
