import { z } from "zod";

export const fireAuditSchema = z
	.object({
		targetRunId: z.number().int().positive(),
	})
	.strict();

export type FireAuditInput = z.infer<typeof fireAuditSchema>;
