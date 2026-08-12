import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/lib/dateUtils";
import { getAuthenticatedUserId } from "~/utils/authorization";

import { runActionSchema } from "~/modules/run/run/application/run.validation";
import {
	abandonRunService,
	dispatchRunActionService,
	getOwnedSwatchesService,
	getTodaysRunService,
	startRunService,
} from "~/modules/run/run/application/run.service";

/**
 * The trust boundary (DVTD-ay5e): the server owns run state and correctness.
 * Clients send intent (a RunAction) and only ever receive the redacted
 * RunView — never RunState, never option `correct` flags.
 */

export const getTodaysRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getTodaysRunService({ userId, date: getTodayDateString() });
	}
);

export const startRun = createServerFn({ method: "POST" }).handler(async () => {
	const userId = await getAuthenticatedUserId();
	return startRunService({ userId, date: getTodayDateString() });
});

/** Give up the active run: 50% of leftover storage banks, a fresh start opens (DVTD-li9i). */
export const abandonRun = createServerFn({ method: "POST" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return abandonRunService({ userId });
	}
);

export const dispatchRunAction = createServerFn({ method: "POST" })
	.validator(z.object({ action: runActionSchema }).strict())
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return dispatchRunActionService({
			userId,
			date: getTodayDateString(),
			action: data.action,
		});
	});

/**
 * The viewer's swatch collection. userId comes from the session, never the
 * client — the collection is per-user.
 */
export const getOwnedSwatches = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getOwnedSwatchesService({ userId });
	}
);
