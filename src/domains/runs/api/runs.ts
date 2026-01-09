import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuthenticatedUserId } from "~/utils/authorization";

import {
	getOrCreateActiveRun,
	getUserActiveRun,
	getLastRunForUser,
	finishRunHandler,
	skipShopHandler,
	getAllRunsHandler,
} from "./handlers";

export const getOrCreateRun = createServerFn({ method: "GET" })
	.inputValidator(
		z
			.object({
				challengeModeId: z.string(),
			})
			.required()
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await getOrCreateActiveRun(userId, data.challengeModeId);
	});

export const getActiveRun = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const userId = await getAuthenticatedUserId();
			return await getUserActiveRun(userId);
		} catch (error) {
			console.error("getActiveRun error:", error);
			// Return null for unauthenticated users (e.g., on /login page)
			return null;
		}
	}
);

export const getLastRunForGameOver = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();

		return await getLastRunForUser(userId);
	}
);

export const finishRunFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await finishRunHandler(userId);
	}
);

export const skipShopServerFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			runId: z.number(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			storageBonus: z.number().default(0),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await skipShopHandler(
			userId,
			data.runId,
			data.date,
			data.storageBonus
		);
	});

export const getAllRunsServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getAllRunsHandler();
	}
);
