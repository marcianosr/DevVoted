import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchUsersByDisplayNames } from "~/modules/account/profile/infrastructure/profile.repository";

export const getUsersByDisplayNames = createServerFn({ method: "GET" })
	.validator(z.object({ displayNames: z.array(z.string()) }))
	.handler(async ({ data }) => {
		return await fetchUsersByDisplayNames(data.displayNames);
	});
