import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getServiceUnlocksService } from "~/modules/run/shop/application/serviceUnlock.service";

/** Which services this account has earned. The user comes from the session, never the client. */
export const getServiceUnlocks = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getServiceUnlocksService({ userId }))
);
