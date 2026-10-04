import { createServerFn } from "@tanstack/react-start";

import { getHallOfFameService } from "~/modules/run/community/application/hallOfFame.service";

export const getHallOfFame = createServerFn({ method: "GET" }).handler(
	async () => getHallOfFameService()
);
