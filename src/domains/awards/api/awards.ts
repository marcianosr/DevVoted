import { createServerFn } from "@tanstack/react-start";

import type { AwardContext } from "../models/award.model";

export const getAwards = createServerFn({ method: "GET" })
	.inputValidator((data: { context: AwardContext }) => data)
	.handler(async ({ data }) => {
		const { getAwardsHandler } = await import("./handlers");
		return getAwardsHandler(data.context);
	});
