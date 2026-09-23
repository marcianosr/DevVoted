import { z } from "zod";

const MAX_ROUTE_ID_LENGTH = 64;

/**
 * `.strict()` and a length cap, but the real guard is `isKnownRouteId` in the
 * service: this endpoint takes no session, so the route id is checked against
 * the generated tree rather than against a pattern.
 */
export const recordVisitSchema = z
	.object({
		routeId: z.string().min(1).max(MAX_ROUTE_ID_LENGTH),
	})
	.strict();

export type RecordVisitInput = z.infer<typeof recordVisitSchema>;
