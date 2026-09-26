import { createServerFn } from "@tanstack/react-start";

import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getConfigdexService } from "~/modules/collection/dex/application/configdex.service";

export const getConfigdex = createServerFn({ method: "GET" }).handler(
	async () => withAuthenticatedUser((userId) => getConfigdexService({ userId }))
);
