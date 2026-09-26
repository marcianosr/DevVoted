import { z } from "zod";

import { AUDIT_IDS } from "~/modules/run/gate/domain/audit.model";

export const fireAuditSchema = z
	.object({
		targetRunId: z.number().int().positive(),
		auditId: z.enum(AUDIT_IDS),
	})
	.strict();

export type FireAuditInput = z.infer<typeof fireAuditSchema>;
