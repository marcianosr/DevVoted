import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { saveLookService } from "~/modules/account/profile/application/look.service";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";

const look = z.object({
	borderId: z.string().min(1).nullable(),
	titleIds: z.array(z.string().min(1)),
});

export const saveLook = createServerFn({ method: "POST" })
	.validator(look)
	.handler(async ({ data }) =>
		saveLookService(await getAuthenticatedUserId(), data)
	);
