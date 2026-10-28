import { createServerFn } from "@tanstack/react-start";

import { withMemberUser } from "~/shared/utils/authorization";

import { getHallOfFameService } from "~/modules/run/community/application/hallOfFame.service";

export const getHallOfFame = createServerFn({ method: "GET" }).handler(
	async () => withMemberUser(() => getHallOfFameService())
);
