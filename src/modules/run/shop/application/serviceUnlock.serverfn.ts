import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getServiceUnlocksService } from "~/modules/run/shop/application/serviceUnlock.service";

export const getServiceUnlocks = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getServiceUnlocksService({ userId }))
);
