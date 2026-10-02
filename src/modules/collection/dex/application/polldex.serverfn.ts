import { createServerFn } from "@tanstack/react-start";

import { getPolldexService } from "~/modules/collection/dex/application/polldex.service";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

export const getPolldex = createServerFn({ method: "GET" }).handler(() =>
	withAuthenticatedUser(({ userId }) => getPolldexService({ userId }))
);
