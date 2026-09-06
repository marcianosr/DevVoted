import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getConfigdexService } from "~/modules/collection/dex/application/configdex.service";

/**
 * The viewer's unlock ledger and objective counters. userId comes from the
 * session, never the client — progress is per-account.
 */
export const getConfigdex = createServerFn({ method: "GET" }).handler(
	async () => withAuthenticatedUser((userId) => getConfigdexService({ userId }))
);
