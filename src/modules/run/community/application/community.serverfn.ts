import { createServerFn } from "@tanstack/react-start";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getRunCommunityService } from "~/modules/run/community/application/community.service";

/** Community comparison for today's segment — only polls the viewer is past. */
export const getRunCommunity = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getRunCommunityService({ userId, date: getTodayDateString() })
		)
);
