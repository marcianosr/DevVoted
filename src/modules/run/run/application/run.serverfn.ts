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
	getRunRecapService,
	getTodaysRunService,
	startRunService,
} from "~/modules/run/run/application/run.service";

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

export const getRunRecap = createServerFn({ method: "GET" })
	.validator(z.object({ runId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			getRunRecapService({ userId, runId: data.runId })
		)
	);

export const getUpcomingCategories = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getUpcomingCategoriesService({ userId }))
);

export const getOwnedSwatches = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getOwnedSwatchesService({ userId }))
);
