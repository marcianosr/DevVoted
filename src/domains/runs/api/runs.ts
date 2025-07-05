import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getOrCreateActiveRun,
	getUserActiveRun,
	finishUserRun,
} from "./handlers";

export const getOrCreateRun = createServerFn()
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getOrCreateActiveRun(data.userId);
	});

export const getActiveRun = createServerFn()
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getUserActiveRun(data.userId);
	});

export const finishRun = createServerFn()
	.validator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		return await finishUserRun(data.runId);
	});
