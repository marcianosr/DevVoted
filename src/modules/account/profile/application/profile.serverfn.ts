import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getPublicProfileService } from "~/modules/account/profile/application/publicProfile.service";

export const getPublicProfile = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.uuid() }))
	.handler(async ({ data }) => getPublicProfileService(data.userId));
