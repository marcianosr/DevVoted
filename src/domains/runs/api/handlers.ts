import {
	getActiveRunByUserId,
	createRunForUser,
	finishRun,
	addConfigsToRun,
	getLastRunFromUser,
} from "./queries";
import { handleApiOperation } from "~/utils/errorHandling";

export const getOrCreateActiveRun = async (userId: string) => {
	return handleApiOperation(async () => {
		// Check if user has an active run
		const activeRun = await getActiveRunByUserId(userId);

		if (activeRun) {
			return activeRun;
		}

		// Create a new run
		const newRunData = await createRunForUser(userId);
		return newRunData;
	}, "Failed to get or create run");
};

export const getUserActiveRun = async (userId: string) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		return activeRun;
	}, "Failed to get active run");
};

export const finishUserRun = async (runId: number) => {
	return handleApiOperation(async () => {
		const finishedRun = await finishRun(runId);

		if (!finishedRun) {
			throw new Error("Run not found");
		}

		return finishedRun;
	}, "Failed to finish run");
};

export const getLastRunForUser = async (userId: string) => {
	return handleApiOperation(async () => {
		const lastRun = await getLastRunFromUser(userId);
		return lastRun;
	}, "Failed to get last run");
};
