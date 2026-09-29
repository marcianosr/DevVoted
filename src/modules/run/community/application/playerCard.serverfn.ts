import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getPlayerCardService } from "~/modules/run/community/application/playerCard.service";

export const getPlayerCard = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.uuid() }))
	.handler(async ({ data }) => getPlayerCardService(data.userId));
