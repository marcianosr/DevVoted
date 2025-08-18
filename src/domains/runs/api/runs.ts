import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getOrCreateActiveRun,
	getUserActiveRun,
	getLastRunForUser,
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

export const getLastRunForGameOver = createServerFn()
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await getLastRunForUser(data.userId);
	});
