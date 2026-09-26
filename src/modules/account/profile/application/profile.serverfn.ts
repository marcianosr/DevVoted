import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getPublicProfileService } from "~/modules/account/profile/application/publicProfile.service";
import { fetchUsersByDisplayNames } from "~/modules/account/profile/infrastructure/profile.repository";

export const getUsersByDisplayNames = createServerFn({ method: "GET" })
	.validator(z.object({ displayNames: z.array(z.string()) }))
	.handler(async ({ data }) => {
		return await fetchUsersByDisplayNames(data.displayNames);
	});

export const getPublicProfile = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.uuid() }))
	.handler(async ({ data }) => getPublicProfileService(data.userId));
