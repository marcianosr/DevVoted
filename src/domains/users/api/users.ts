import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchUsersByDisplayNames } from "./queries";

export const getUsersByDisplayNames = createServerFn({ method: "GET" })
	.inputValidator(z.object({ displayNames: z.array(z.string()) }))
	.handler(async ({ data }) => {
		return await fetchUsersByDisplayNames(data.displayNames);
	});
