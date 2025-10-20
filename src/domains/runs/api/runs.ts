import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getOrCreateActiveRun,
	getUserActiveRun,
	getLastRunForUser,
	finishRunHandler,
} from "./handlers";

export const getOrCreateRun = createServerFn()
	.inputValidator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getOrCreateActiveRun(data.userId);
	});

export const getActiveRun = createServerFn()
	.inputValidator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getUserActiveRun(data.userId);
	});

export const getLastRunForGameOver = createServerFn()
	.inputValidator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getLastRunForUser(data.userId);
	});

export const finishRunFn = createServerFn()
	.inputValidator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await finishRunHandler(data.userId);
	});
