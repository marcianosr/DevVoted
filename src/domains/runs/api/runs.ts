import { createServerFn } from "@tanstack/react-start";
import {
	getOrCreateActiveRun,
	getUserActiveRun,
	getLastRunForUser,
	finishRunHandler,
} from "./handlers";
import { getAuthenticatedUserId } from "~/utils/authorization";

export const getOrCreateRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await getOrCreateActiveRun(userId);
	}
);

export const getActiveRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await getUserActiveRun(userId);
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
