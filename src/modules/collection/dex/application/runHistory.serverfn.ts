import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getGateRunsService } from "~/modules/collection/dex/application/runHistory.service";

export const getGateRuns = createServerFn({ method: "GET" }).handler(async () =>
	withAuthenticatedUser((userId) => getGateRunsService({ userId }))
);
