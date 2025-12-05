import { createServerFn } from "@tanstack/react-start";

import { CategoryCode } from "~/domains/shared/categories";

export const getLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getLiveRunRankingsHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getLiveRunRankingsHandler(data.categoryCode);
	});
