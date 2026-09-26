import { z } from "zod";

const MAX_ROUTE_ID_LENGTH = 64;

export const recordVisitSchema = z
	.object({
		routeId: z.string().min(1).max(MAX_ROUTE_ID_LENGTH),
	})
	.strict();

export type RecordVisitInput = z.infer<typeof recordVisitSchema>;
