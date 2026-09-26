import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	equipBorderService,
	getArchiveStateService,
	purchaseBorderService,
} from "~/modules/account/profile/application/archive.service";
import { getAuthenticatedUserId } from "~/shared/utils/authorization";

export const getArchiveState = createServerFn({ method: "GET" }).handler(
	async () => getArchiveStateService(await getAuthenticatedUserId())
);

export const purchaseBorder = createServerFn({ method: "POST" })
	.validator(z.object({ borderId: z.string().min(1) }))
	.handler(async ({ data }) =>
		purchaseBorderService(await getAuthenticatedUserId(), data.borderId)
	);

export const equipBorder = createServerFn({ method: "POST" })
	.validator(z.object({ borderId: z.string().min(1).nullable() }))
	.handler(async ({ data }) =>
		equipBorderService(await getAuthenticatedUserId(), data.borderId)
	);
