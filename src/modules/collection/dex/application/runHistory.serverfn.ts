import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getGateRunsService } from "~/modules/collection/dex/application/runHistory.service";

/**
 * The viewer's climbs, reduced to what the Audits tab tallies. userId comes
 * from the session, never the client — the history is per-user.
 */
export const getGateRuns = createServerFn({ method: "GET" }).handler(async () =>
	withAuthenticatedUser((userId) => getGateRunsService({ userId }))
);
