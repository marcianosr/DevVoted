import { redirect } from "@tanstack/react-router";
import { getActiveRun } from "../api/runs";

export const requiresActiveRun = async () => {
	const result = await getActiveRun();

	// Handle server error or no active run - redirect to start page
	if (!result.success || !result.data) {
		throw redirect({
			to: "/start",
		});
	}

	return result.data;
};
