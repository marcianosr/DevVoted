import { z } from "zod";

import { AUDIT_IDS } from "~/modules/run/gate/domain/audit.model";

/** The client names a rival's run and one of the payloads it was offered; the server re-derives the offer. */
export const fireAuditSchema = z
	.object({
		targetRunId: z.number().int().positive(),
		auditId: z.enum(AUDIT_IDS),
	})
	.strict();

export type FireAuditInput = z.infer<typeof fireAuditSchema>;
