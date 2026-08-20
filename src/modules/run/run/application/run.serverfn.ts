import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getUpcomingCategoriesService } from "~/modules/run/run/application/prefetch.service";
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
	async () =>
		withAuthenticatedUser((userId) =>
			getTodaysRunService({ userId, date: getTodayDateString() })
		)
);

export const startRun = createServerFn({ method: "POST" }).handler(async () =>
	withAuthenticatedUser((userId) =>
		startRunService({ userId, date: getTodayDateString() })
	)
);

/** Give up the active run: 50% of leftover storage banks, a fresh start opens (DVTD-li9i). */
export const abandonRun = createServerFn({ method: "POST" }).handler(async () =>
	withAuthenticatedUser((userId) => abandonRunService({ userId }))
);

export const dispatchRunAction = createServerFn({ method: "POST" })
	.validator(z.object({ action: runActionSchema }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			dispatchRunActionService({
				userId,
				date: getTodayDateString(),
				action: data.action,
			})
		)
	);

/** Tomorrow's poll categories — Prefetch's product; refused without the config. */
export const getUpcomingCategories = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getUpcomingCategoriesService({ userId }))
);

/**
 * The viewer's swatch collection. userId comes from the session, never the
 * client — the collection is per-user.
 */
export const getOwnedSwatches = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getOwnedSwatchesService({ userId }))
);
