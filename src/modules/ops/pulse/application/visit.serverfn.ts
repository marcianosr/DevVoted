import { createServerFn } from "@tanstack/react-start";

import { recordVisitService } from "~/modules/ops/pulse/application/visit.service";
import { recordVisitSchema } from "~/modules/ops/pulse/application/visit.validation";
import { getTodayDateString } from "~/shared/lib/dateUtils";

/**
 * Deliberately unauthenticated, and deliberately returns nothing.
 *
 * Seeing signed-out visitors is the whole point — the app is otherwise entirely
 * behind auth, so `/` → `/login` → `/sign-up` is invisible to every other
 * table. Requiring a session here would blind exactly the funnel this exists to
 * measure. The user id is read from the session server-side and never accepted
 * from the caller; the abuse surface is closed structurally instead, by the
 * route-id allowlist and the unique key that caps a visitor to one row per
 * screen per day.
 */
export const recordVisit = createServerFn({ method: "POST" })
	.validator(recordVisitSchema)
	.handler(async ({ data }) => {
		await recordVisitService({
			routeId: data.routeId,
			date: getTodayDateString(),
		});
	});

/**
 * Fire-and-forget. Never awaited on a navigation, and the `.catch` is
 * load-bearing rather than decorative: an unhandled rejection from a floating
 * promise would take down the Node process a dead visit counter has no business
 * touching.
 */
export const recordScreen = (
	matches: ReadonlyArray<{ routeId: string }>
): void => {
	const routeId = matches.at(-1)?.routeId;
	if (!routeId) return;
	void recordVisit({ data: { routeId } }).catch(() => {});
};
