import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import {
	withAuthenticatedUser,
	withMemberUser,
} from "~/shared/utils/authorization";

import {
	runActionSchema,
	warmBootPickSchema,
} from "~/modules/run/run/application/run.validation";
import { warmBootRunService } from "~/modules/run/run/application/warmBoot.service";
import {
	abandonRunService,
	dispatchRunActionService,
	getOwnedSwatchesService,
	getPollsLeftTodayService,
	getRunNumberService,
	getRunRecapService,
	getTodaysRunService,
	startRunService,
} from "~/modules/run/run/application/run.service";

export const getTodaysRun = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) =>
			getTodaysRunService({ userId, date: getTodayDateString() })
		)
);

export const getPollsLeftToday = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) =>
			getPollsLeftTodayService({ userId, date: getTodayDateString() })
		)
);

export const startRun = createServerFn({ method: "POST" }).handler(async () =>
	withAuthenticatedUser(({ userId, isGuest }) =>
		startRunService({ userId, date: getTodayDateString(), isGuest })
	)
);

export const warmBootRun = createServerFn({ method: "POST" })
	.validator(warmBootPickSchema)
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId, isGuest }) =>
			warmBootRunService({
				userId,
				isGuest,
				date: getTodayDateString(),
				pick: data,
			})
		)
	);

export const abandonRun = createServerFn({ method: "POST" }).handler(async () =>
	withMemberUser(({ userId }) => abandonRunService({ userId }))
);

export const dispatchRunAction = createServerFn({ method: "POST" })
	.validator(z.object({ action: runActionSchema }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId, isGuest }) =>
			dispatchRunActionService({
				isGuest,
				userId,
				date: getTodayDateString(),
				action: data.action,
			})
		)
	);

export const getRunRecap = createServerFn({ method: "GET" })
	.validator(z.object({ runId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			getRunRecapService({ userId, runId: data.runId })
		)
	);

export const getOwnedSwatches = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) => getOwnedSwatchesService({ userId }))
);

export const getRunNumber = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) => getRunNumberService({ userId }))
);
