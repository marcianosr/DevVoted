import { redirect } from "@tanstack/react-router";
import { getActiveRun } from "../api/runs";

export const requireActiveRun = async () => {
	const result = await getActiveRun();

	if (!result.success || !result.data) {
		throw redirect({
			to: "/start",
		});
	}

	return result.data;
};
