import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	acknowledgeTitlesService,
	equipTitleService,
	getTitleAnnouncementService,
	getTitleStateService,
} from "~/modules/account/profile/application/title.service";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";

export const getTitleState = createServerFn({ method: "GET" }).handler(
	async () => getTitleStateService(await getAuthenticatedUserId())
);

export const equipTitle = createServerFn({ method: "POST" })
	.validator(z.object({ titleId: z.string().min(1).nullable() }))
	.handler(async ({ data }) =>
		equipTitleService(await getAuthenticatedUserId(), data.titleId)
	);

export const getTitleAnnouncement = createServerFn({ method: "GET" }).handler(
	async () => getTitleAnnouncementService(await getAuthenticatedUserId())
);

export const acknowledgeTitles = createServerFn({ method: "POST" })
	.validator(z.object({ titleIds: z.array(z.string().min(1)) }))
	.handler(async ({ data }) =>
		acknowledgeTitlesService(await getAuthenticatedUserId(), data.titleIds)
	);
