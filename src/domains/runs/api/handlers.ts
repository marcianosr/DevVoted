import { getActiveRunByUserId, createRunForUser, getRunWithCategoryXp, finishRun } from "./queries";

export const getOrCreateActiveRun = async (userId: string) => {
	try {
		// Check if user has an active run
		const activeRun = await getActiveRunByUserId(userId);
		
		if (activeRun) {
			// Get the run with its category XP data
			const runWithXp = await getRunWithCategoryXp(activeRun.id);
			return { success: true, data: runWithXp };
		}
		
		// Create a new run
		const newRunData = await createRunForUser(userId);
		return { success: true, data: newRunData };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to get or create run";
		return { success: false, error: message };
	}
};

export const getUserActiveRun = async (userId: string) => {
	try {
		const activeRun = await getActiveRunByUserId(userId);
		
		if (!activeRun) {
			return { success: false, error: "No active run found" };
		}
		
		const runWithXp = await getRunWithCategoryXp(activeRun.id);
		return { success: true, data: runWithXp };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to get active run";
		return { success: false, error: message };
	}
};

export const finishUserRun = async (runId: number) => {
	try {
		const finishedRun = await finishRun(runId);
		
		if (!finishedRun) {
			return { success: false, error: "Run not found" };
		}
		
		return { success: true, data: finishedRun };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to finish run";
		return { success: false, error: message };
	}
};