import { createServerFn } from "@tanstack/react-start";

import { recordVisitService } from "~/modules/ops/pulse/application/visit.service";
import { recordVisitSchema } from "~/modules/ops/pulse/application/visit.validation";
import { getTodayDateString } from "~/shared/lib/dateUtils";

export const recordVisit = createServerFn({ method: "POST" })
	.validator(recordVisitSchema)
	.handler(async ({ data }) => {
		await recordVisitService({
			routeId: data.routeId,
			date: getTodayDateString(),
		});
	});

export const recordScreen = (
	matches: ReadonlyArray<{ routeId: string }>
): void => {
	const routeId = matches.at(-1)?.routeId;
	if (!routeId) return;
	void recordVisit({ data: { routeId } }).catch(() => {});
};
