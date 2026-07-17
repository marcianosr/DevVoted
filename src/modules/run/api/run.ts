import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/lib/dateUtils";
import { getAuthenticatedUserId } from "~/utils/authorization";

import { runActionSchema } from "../validation/schemas.validation";
import {
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
