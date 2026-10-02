import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	getArchiveStateService,
	purchaseBorderService,
} from "~/modules/account/profile/application/archive.service";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

export const getArchiveState = createServerFn({ method: "GET" }).handler(() =>
	withAuthenticatedUser(({ userId }) => getArchiveStateService(userId))
);

export const purchaseBorder = createServerFn({ method: "POST" })
	.validator(z.object({ borderId: z.string().min(1) }))
	.handler(({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			purchaseBorderService(userId, data.borderId)
		)
	);
