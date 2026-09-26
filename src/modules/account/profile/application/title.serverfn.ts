import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	acknowledgeTitlesService,
	getTitleAnnouncementService,
	getTitleStateService,
	removeTitleService,
	wearTitleService,
} from "~/modules/account/profile/application/title.service";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";

const wornTitle = z.object({ titleId: z.string().min(1) });

export const getTitleState = createServerFn({ method: "GET" }).handler(
	async () => getTitleStateService(await getAuthenticatedUserId())
);

export const wearTitle = createServerFn({ method: "POST" })
	.validator(wornTitle)
	.handler(async ({ data }) =>
		wearTitleService(await getAuthenticatedUserId(), data.titleId)
	);

export const removeTitle = createServerFn({ method: "POST" })
	.validator(wornTitle)
	.handler(async ({ data }) =>
		removeTitleService(await getAuthenticatedUserId(), data.titleId)
	);

export const getTitleAnnouncement = createServerFn({ method: "GET" }).handler(
	async () => getTitleAnnouncementService(await getAuthenticatedUserId())
);

export const acknowledgeTitles = createServerFn({ method: "POST" })
	.validator(z.object({ titleIds: z.array(z.string().min(1)) }))
	.handler(async ({ data }) =>
		acknowledgeTitlesService(await getAuthenticatedUserId(), data.titleIds)
	);
