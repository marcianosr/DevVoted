import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	acknowledgeTitlesService,
	getTitleAnnouncementService,
	getTitleStateService,
} from "~/modules/account/profile/application/title.service";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

export const getTitleState = createServerFn({ method: "GET" }).handler(() =>
	withAuthenticatedUser(({ userId }) => getTitleStateService(userId))
);

export const getTitleAnnouncement = createServerFn({ method: "GET" }).handler(
	() =>
		withAuthenticatedUser(({ userId }) => getTitleAnnouncementService(userId))
);

export const acknowledgeTitles = createServerFn({ method: "POST" })
	.validator(z.object({ titleIds: z.array(z.string().min(1)) }))
	.handler(({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			acknowledgeTitlesService(userId, data.titleIds)
		)
	);
